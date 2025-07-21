import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateImageFile, validateCropParameters } from "@/lib/validation";
import { ICON_SETTINGS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract file and crop parameters
    const imageFile = formData.get("image") as File;
    const x = parseInt(formData.get("x") as string);
    const y = parseInt(formData.get("y") as string);
    const size = parseInt(formData.get("size") as string);

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "Please provide an image file." },
        { status: 400 }
      );
    }

    // Validate image file
    const fileValidation = validateImageFile(imageFile);
    if (!fileValidation.isValid) {
      return NextResponse.json(
        { success: false, error: fileValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Get image metadata
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { success: false, error: "Unable to read image dimensions." },
        { status: 400 }
      );
    }

    // Validate crop parameters
    const cropValidation = validateCropParameters(
      x,
      y,
      size,
      metadata.width,
      metadata.height
    );
    if (!cropValidation.isValid) {
      return NextResponse.json(
        { success: false, error: cropValidation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Crop the image to the specified square region
    const croppedImage = await image
      .extract({ left: x, top: y, width: size, height: size })
      .png()
      .toBuffer();

    // Generate PNG format at 128x128 (standard icon size)
    const pngIcon = await sharp(croppedImage)
      .resize(ICON_SETTINGS.ICO_SIZE, ICON_SETTINGS.ICO_SIZE, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();

    // Generate ICO format
    // Note: Sharp doesn't directly support ICO format, so we'll create a PNG and
    // let the client handle it as ICO (most browsers support PNG in ICO containers)
    const icoIcon = await sharp(croppedImage)
      .resize(ICON_SETTINGS.ICO_SIZE, ICON_SETTINGS.ICO_SIZE, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png({ quality: 100, compressionLevel: 6 })
      .toBuffer();

    // Convert to base64 for response
    const base64Png = pngIcon.toString("base64");
    const base64Ico = icoIcon.toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        png: base64Png,
        ico: base64Ico,
        size: ICON_SETTINGS.ICO_SIZE,
        cropArea: { x, y, size },
        originalDimensions: { width: metadata.width, height: metadata.height },
      },
    });
  } catch (error) {
    console.error("Error in icon-maker API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during icon generation.",
      },
      { status: 500 }
    );
  }
}
