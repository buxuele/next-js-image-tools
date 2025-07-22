import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateImageFile, validateCropParameters } from "@/lib/validation";
import { ICON_SETTINGS } from "@/lib/constants";
import {
  handleApiError,
  ValidationError,
  ImageProcessingError,
  CropParameterError,
} from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract file and crop parameters
    const imageFile = formData.get("image") as File;
    const x = parseInt(formData.get("x") as string);
    const y = parseInt(formData.get("y") as string);
    const size = parseInt(formData.get("size") as string);

    if (!imageFile) {
      throw new ValidationError("Please provide an image file.");
    }

    // Validate image file
    const fileValidation = validateImageFile(imageFile);
    if (!fileValidation.isValid) {
      throw new ValidationError(fileValidation.errors.join(", "));
    }

    // Convert file to buffer
    let buffer: Buffer;
    try {
      buffer = Buffer.from(await imageFile.arrayBuffer());
    } catch {
      throw new ValidationError("Failed to read uploaded image file.");
    }

    // Get image metadata
    let metadata: sharp.Metadata;
    try {
      const image = sharp(buffer);
      metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new ImageProcessingError("Unable to read image dimensions.");
      }
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError("Invalid image format or corrupted file.");
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
      throw new CropParameterError(cropValidation.errors.join(", "), {
        x,
        y,
        size,
      });
    }

    // Crop the image to the specified square region
    let croppedImage: Buffer;
    try {
      const image = sharp(buffer);
      croppedImage = await image
        .extract({ left: x, top: y, width: size, height: size })
        .png()
        .toBuffer();
    } catch {
      throw new ImageProcessingError(
        "Failed to crop image with specified parameters."
      );
    }

    // Generate PNG format at 128x128 (standard icon size)
    let pngIcon: Buffer;
    let icoIcon: Buffer;
    try {
      pngIcon = await sharp(croppedImage)
        .resize(ICON_SETTINGS.ICO_SIZE, ICON_SETTINGS.ICO_SIZE, {
          fit: "fill",
          kernel: sharp.kernel.lanczos3,
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();

      // Generate ICO format
      // Note: Sharp doesn't directly support ICO format, so we'll create a PNG and
      // let the client handle it as ICO (most browsers support PNG in ICO containers)
      icoIcon = await sharp(croppedImage)
        .resize(ICON_SETTINGS.ICO_SIZE, ICON_SETTINGS.ICO_SIZE, {
          fit: "fill",
          kernel: sharp.kernel.lanczos3,
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();
    } catch {
      throw new ImageProcessingError("Failed to generate icon formats.");
    }

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
    const { response, status } = handleApiError("icon-maker", error);
    return NextResponse.json(response, { status });
  }
}
