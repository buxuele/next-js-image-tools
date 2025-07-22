import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateDualMergeFiles } from "@/lib/validation";
import { DUAL_MERGE_LABELS } from "@/lib/constants";
import {
  handleApiError,
  ValidationError,
  ImageProcessingError,
} from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files and options
    const files: File[] = [];
    const file1 = formData.get("file1") as File;
    const file2 = formData.get("file2") as File;
    const addTextLabels = formData.get("addTextLabels") === "true";

    if (!file1 || !file2) {
      throw new ValidationError("Please provide exactly 2 image files.");
    }

    files.push(file1, file2);

    // Validate files
    const validation = validateDualMergeFiles(files);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(", "));
    }

    // Convert files to buffers
    let buffer1: Buffer, buffer2: Buffer;
    try {
      buffer1 = Buffer.from(await file1.arrayBuffer());
      buffer2 = Buffer.from(await file2.arrayBuffer());
    } catch {
      throw new ValidationError("Failed to read uploaded files.");
    }

    // Get image metadata
    let metadata1: sharp.Metadata, metadata2: sharp.Metadata;
    try {
      const image1 = sharp(buffer1);
      const image2 = sharp(buffer2);

      [metadata1, metadata2] = await Promise.all([
        image1.metadata(),
        image2.metadata(),
      ]);

      if (
        !metadata1.width ||
        !metadata1.height ||
        !metadata2.width ||
        !metadata2.height
      ) {
        throw new ImageProcessingError("Unable to read image dimensions.");
      }
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError(
        "Invalid image format or corrupted files."
      );
    }

    // Calculate target height (use the smaller height)
    const targetHeight = Math.min(metadata1.height, metadata2.height);

    // Resize images to same height while maintaining aspect ratio
    let resizedImage1: Buffer, resizedImage2: Buffer;
    try {
      const image1 = sharp(buffer1);
      const image2 = sharp(buffer2);

      resizedImage1 = await image1
        .resize({ height: targetHeight, withoutEnlargement: true })
        .png()
        .toBuffer();

      resizedImage2 = await image2
        .resize({ height: targetHeight, withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      throw new ImageProcessingError("Failed to resize images for merging.");
    }

    // Get dimensions of resized images
    let resizedMeta1: sharp.Metadata, resizedMeta2: sharp.Metadata;
    try {
      [resizedMeta1, resizedMeta2] = await Promise.all([
        sharp(resizedImage1).metadata(),
        sharp(resizedImage2).metadata(),
      ]);

      if (!resizedMeta1.width || !resizedMeta2.width) {
        throw new ImageProcessingError(
          "Failed to get resized image dimensions."
        );
      }
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError("Failed to process resized images.");
    }

    const width1 = resizedMeta1.width;
    const width2 = resizedMeta2.width;
    const totalWidth = width1 + width2;

    let mergedImage: Buffer;

    try {
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
              input:
                Buffer.from(`<svg width="${width1}" height="${labelHeight}">
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
              input:
                Buffer.from(`<svg width="${width2}" height="${labelHeight}">
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
    } catch {
      throw new ImageProcessingError("Failed to merge images.");
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
    const { response, status } = handleApiError("dual-merge", error);
    return NextResponse.json(response, { status });
  }
}
