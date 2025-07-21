import { NextRequest, NextResponse } from "next/server";
import { validateTextFiles } from "@/lib/validation";
import { generateHtmlDiffServer } from "@/lib/diff-utils";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files
    const file1 = formData.get("file1") as File;
    const file2 = formData.get("file2") as File;

    if (!file1 || !file2) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide exactly 2 files for comparison.",
        },
        { status: 400 }
      );
    }

    const files = [file1, file2];

    // Validate files
    const validation = validateTextFiles(files);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Read file contents
    let text1: string;
    let text2: string;

    try {
      // Try to read as UTF-8 first
      text1 = await file1.text();
      text2 = await file2.text();
    } catch {
      // If UTF-8 fails, try to read as binary and convert
      try {
        const buffer1 = await file1.arrayBuffer();
        const buffer2 = await file2.arrayBuffer();

        // Try different encodings
        text1 = new TextDecoder("utf-8", { fatal: false }).decode(buffer1);
        text2 = new TextDecoder("utf-8", { fatal: false }).decode(buffer2);

        // If still contains replacement characters, try latin1
        if (text1.includes("\uFFFD") || text2.includes("\uFFFD")) {
          text1 = new TextDecoder("latin1").decode(buffer1);
          text2 = new TextDecoder("latin1").decode(buffer2);
        }
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to decode file contents. Please ensure files are text files.",
          },
          { status: 400 }
        );
      }
    }

    // Check if files are too large for processing
    if (text1.length > 1000000 || text2.length > 1000000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Files are too large for comparison. Maximum size is 1MB per file.",
        },
        { status: 400 }
      );
    }

    // Generate HTML diff
    const htmlDiff = generateHtmlDiffServer(
      text1,
      text2,
      file1.name,
      file2.name
    );

    // Calculate some statistics
    const lines1 = text1.split("\n").length;
    const lines2 = text2.split("\n").length;
    const chars1 = text1.length;
    const chars2 = text2.length;

    return NextResponse.json({
      success: true,
      data: {
        diff: htmlDiff,
        statistics: {
          file1: {
            name: file1.name,
            lines: lines1,
            characters: chars1,
            size: file1.size,
          },
          file2: {
            name: file2.name,
            lines: lines2,
            characters: chars2,
            size: file2.size,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in file-diff API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during file comparison.",
      },
      { status: 500 }
    );
  }
}
