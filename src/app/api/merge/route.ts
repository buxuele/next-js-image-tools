import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateDualMergeFiles } from "@/lib/validation";
import { DUAL_MERGE_LABELS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files and options
    const files: File[] = [];
    const file1 = formData.get("file1") as File;
    const file2 = formData.get("file2") as File;
    const addTextLabels = formData.get("addTextLabels") === "true";

    if (!file1 || !file2) {
      return NextResponse.json(
        { success: false, error: "Please provide exactly 2 image files." },
        { status: 400 }
      );
    }

    files.push(file1, file2);

    // Validate files
    const validation = validateDualMergeFiles(files);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Convert files to buffers
    const buffer1 = Buffer.from(await file1.arrayBuffer());
    const buffer2 = Buffer.from(await file2.arrayBuffer());

    // Get image metadata
    const image1 = sharp(buffer1);
    const image2 = sharp(buffer2);

    const [metadata1, metadata2] = await Promise.all([
      image1.metadata(),
      image2.metadata(),
    ]);

    if (
      !metadata1.width ||
      !metadata1.height ||
      !metadata2.width ||
      !metadata2.height
    ) {
      return NextResponse.json(
        { success: false, error: "Unable to read image dimensions." },
        { status: 400 }
      );
    }

    // Calculate target height (use the smaller height)
    const targetHeight = Math.min(metadata1.height, metadata2.height);

    // Resize images to same height while maintaining aspect ratio
    const resizedImage1 = await image1
      .resize({ height: targetHeight, withoutEnlargement: true })
      .png()
      .toBuffer();

    const resizedImage2 = await image2
      .resize({ height: targetHeight, withoutEnlargement: true })
      .png()
      .toBuffer();

    // Get dimensions of resized images
    const [resizedMeta1, resizedMeta2] = await Promise.all([
      sharp(resizedImage1).metadata(),
      sharp(resizedImage2).metadata(),
    ]);

    const width1 = resizedMeta1.width!;
    const width2 = resizedMeta2.width!;
    const totalWidth = width1 + width2;

    let mergedImage: Buffer;

    if (addTextLabels) {
      // Add text labels
      const labelHeight = 40;
      const totalHeightWithLabels = targetHeight + labelHeight;

      // Create label images
      const label1Buffer = await sharp({
        create: {
          width: width1,
          height: labelHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          {
            input: Buffer.from(`<svg width="${width1}" height="${labelHeight}">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, sans-serif" font-size="16" fill="black">
            ${DUAL_MERGE_LABELS.BEFORE}
          </text>
        </svg>`),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();

      const label2Buffer = await sharp({
        create: {
          width: width2,
          height: labelHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          {
            input: Buffer.from(`<svg width="${width2}" height="${labelHeight}">
          <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, sans-serif" font-size="16" fill="black">
            ${DUAL_MERGE_LABELS.AFTER}
          </text>
        </svg>`),
            top: 0,
            left: 0,
          },
        ])
        .png()
        .toBuffer();

      // Merge labels horizontally
      const mergedLabels = await sharp({
        create: {
          width: totalWidth,
          height: labelHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          { input: label1Buffer, top: 0, left: 0 },
          { input: label2Buffer, top: 0, left: width1 },
        ])
        .png()
        .toBuffer();

      // Merge images horizontally
      const mergedImagesOnly = await sharp({
        create: {
          width: totalWidth,
          height: targetHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          { input: resizedImage1, top: 0, left: 0 },
          { input: resizedImage2, top: 0, left: width1 },
        ])
        .png()
        .toBuffer();

      // Combine labels and images vertically
      mergedImage = await sharp({
        create: {
          width: totalWidth,
          height: totalHeightWithLabels,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          { input: mergedLabels, top: 0, left: 0 },
          { input: mergedImagesOnly, top: labelHeight, left: 0 },
        ])
        .png()
        .toBuffer();
    } else {
      // Merge images horizontally without labels
      mergedImage = await sharp({
        create: {
          width: totalWidth,
          height: targetHeight,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .composite([
          { input: resizedImage1, top: 0, left: 0 },
          { input: resizedImage2, top: 0, left: width1 },
        ])
        .png()
        .toBuffer();
    }

    // Convert to base64 for response
    const base64Image = mergedImage.toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        image: base64Image,
        filename: `merged_${Date.now()}.png`,
        mimeType: "image/png",
      },
    });
  } catch (error) {
    console.error("Error in dual merge API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during image processing.",
      },
      { status: 500 }
    );
  }
}
