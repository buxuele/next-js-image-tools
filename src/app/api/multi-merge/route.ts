import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { validateMultiMergeFiles } from "@/lib/validation";
import { MERGE_LAYOUTS } from "@/lib/constants";
import {
  handleApiError,
  ValidationError,
  ImageProcessingError,
} from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files and options
    const fileCount = parseInt(formData.get("fileCount") as string);
    const addSequenceNumbers = formData.get("addSequenceNumbers") === "true";

    if (!fileCount || fileCount < 2 || fileCount > 6) {
      throw new ValidationError("Please provide between 2 and 6 image files.");
    }

    const files: File[] = [];
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File;
      if (!file) {
        throw new ValidationError(`Missing file at position ${i}.`);
      }
      files.push(file);
    }

    // Validate files
    const validation = validateMultiMergeFiles(files);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(", "));
    }

    // Get layout configuration
    const layout = MERGE_LAYOUTS[fileCount as keyof typeof MERGE_LAYOUTS];
    if (!layout) {
      throw new ValidationError("Unsupported number of files.");
    }

    // Convert files to buffers and get metadata
    const imageBuffers: Buffer[] = [];
    const imageMetadata: sharp.Metadata[] = [];

    try {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        imageBuffers.push(buffer);

        const metadata = await sharp(buffer).metadata();
        if (!metadata.width || !metadata.height) {
          throw new ImageProcessingError(`Invalid image: ${file.name}`);
        }
        imageMetadata.push(metadata);
      }
    } catch (error) {
      if (error instanceof ImageProcessingError) {
        throw error;
      }
      throw new ImageProcessingError("Failed to process uploaded images.");
    }

    // Calculate target dimensions
    let targetWidth: number;
    let targetHeight: number;

    if (layout.type === "horizontal") {
      // For horizontal layout, use same height, sum widths
      targetHeight = Math.min(...imageMetadata.map((m) => m.height || 0));
      const resizedWidths = imageMetadata.map((m) =>
        Math.round(((m.width || 0) * targetHeight) / (m.height || 1))
      );
      targetWidth = resizedWidths.reduce((sum, w) => sum + w, 0);
    } else if (layout.type === "vertical") {
      // For vertical layout, use same width, sum heights
      targetWidth = Math.min(...imageMetadata.map((m) => m.width || 0));
      const resizedHeights = imageMetadata.map((m) =>
        Math.round(((m.height || 0) * targetWidth) / (m.width || 1))
      );
      targetHeight = resizedHeights.reduce((sum, h) => sum + h, 0);
    } else {
      // For grid layout, calculate cell size
      const maxWidth = Math.max(...imageMetadata.map((m) => m.width || 0));
      const maxHeight = Math.max(...imageMetadata.map((m) => m.height || 0));

      // Use a reasonable cell size
      const cellWidth = Math.min(maxWidth, 400);
      const cellHeight = Math.min(maxHeight, 400);

      targetWidth = cellWidth * layout.cols;
      targetHeight = cellHeight * layout.rows;
    }

    // Process images based on layout
    const processedImages: Buffer[] = [];

    try {
      if (layout.type === "horizontal") {
        // Resize all images to same height
        for (let i = 0; i < files.length; i++) {
          const resized = await sharp(imageBuffers[i])
            .resize({ height: targetHeight, withoutEnlargement: true })
            .png()
            .toBuffer();
          processedImages.push(resized);
        }
      } else if (layout.type === "vertical") {
        // Resize all images to same width
        for (let i = 0; i < files.length; i++) {
          const resized = await sharp(imageBuffers[i])
            .resize({ width: targetWidth, withoutEnlargement: true })
            .png()
            .toBuffer();
          processedImages.push(resized);
        }
      } else {
        // For grid layout, resize to fit cells
        const cellWidth = targetWidth / layout.cols;
        const cellHeight = targetHeight / layout.rows;

        for (let i = 0; i < files.length; i++) {
          const resized = await sharp(imageBuffers[i])
            .resize({
              width: Math.floor(cellWidth),
              height: Math.floor(cellHeight),
              fit: "inside",
              withoutEnlargement: true,
            })
            .png()
            .toBuffer();
          processedImages.push(resized);
        }
      }
    } catch {
      throw new ImageProcessingError(
        "Failed to resize images for multi-merge layout."
      );
    }

    // Create composite operations
    const compositeOps: sharp.OverlayOptions[] = [];

    if (layout.type === "horizontal") {
      let currentX = 0;
      for (let i = 0; i < processedImages.length; i++) {
        const metadata = await sharp(processedImages[i]).metadata();
        compositeOps.push({
          input: processedImages[i],
          top: 0,
          left: currentX,
        });
        currentX += metadata.width || 0;
      }
    } else if (layout.type === "vertical") {
      let currentY = 0;
      for (let i = 0; i < processedImages.length; i++) {
        const metadata = await sharp(processedImages[i]).metadata();
        compositeOps.push({
          input: processedImages[i],
          top: currentY,
          left: 0,
        });
        currentY += metadata.height || 0;
      }
    } else {
      // Grid layout
      const cellWidth = targetWidth / layout.cols;
      const cellHeight = targetHeight / layout.rows;

      for (let i = 0; i < processedImages.length; i++) {
        const row = Math.floor(i / layout.cols);
        const col = i % layout.cols;

        const metadata = await sharp(processedImages[i]).metadata();
        const imageWidth = metadata.width || 0;
        const imageHeight = metadata.height || 0;

        // Center the image in its cell
        const x = Math.floor(col * cellWidth + (cellWidth - imageWidth) / 2);
        const y = Math.floor(row * cellHeight + (cellHeight - imageHeight) / 2);

        compositeOps.push({
          input: processedImages[i],
          top: y,
          left: x,
        });
      }
    }

    // Add sequence numbers if requested
    if (addSequenceNumbers) {
      const numberOps: sharp.OverlayOptions[] = [];

      for (let i = 0; i < files.length; i++) {
        const number = (i + 1).toString();
        let x: number, y: number;

        if (layout.type === "horizontal") {
          // Calculate position for horizontal layout
          let currentX = 0;
          for (let j = 0; j < i; j++) {
            const metadata = await sharp(processedImages[j]).metadata();
            currentX += metadata.width || 0;
          }
          const metadata = await sharp(processedImages[i]).metadata();
          x = currentX + (metadata.width || 0) / 2;
          y = 30;
        } else if (layout.type === "vertical") {
          // Calculate position for vertical layout
          let currentY = 0;
          for (let j = 0; j < i; j++) {
            const metadata = await sharp(processedImages[j]).metadata();
            currentY += metadata.height || 0;
          }
          x = targetWidth / 2;
          y = currentY + 30;
        } else {
          // Grid layout
          const cellWidth = targetWidth / layout.cols;
          const cellHeight = targetHeight / layout.rows;
          const row = Math.floor(i / layout.cols);
          const col = i % layout.cols;

          x = col * cellWidth + cellWidth / 2;
          y = row * cellHeight + 30;
        }

        // Create number overlay
        const numberSvg = `<svg width="40" height="40">
          <circle cx="20" cy="20" r="18" fill="rgba(0,0,0,0.7)" stroke="white" stroke-width="2"/>
          <text x="20" y="20" text-anchor="middle" dominant-baseline="middle" 
                font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">
            ${number}
          </text>
        </svg>`;

        numberOps.push({
          input: Buffer.from(numberSvg),
          top: Math.floor(y - 20),
          left: Math.floor(x - 20),
        });
      }

      compositeOps.push(...numberOps);
    }

    // Create the final merged image
    const mergedImage = await sharp({
      create: {
        width: Math.floor(targetWidth),
        height: Math.floor(targetHeight),
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .composite(compositeOps)
      .png()
      .toBuffer();

    // Convert to base64 for response
    const base64Image = mergedImage.toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        image: base64Image,
        filename: `multi_merged_${fileCount}_${Date.now()}.png`,
        mimeType: "image/png",
        layout: layout.type,
        dimensions: `${Math.floor(targetWidth)}x${Math.floor(targetHeight)}`,
      },
    });
  } catch (error) {
    const { response, status } = handleApiError("multi-merge", error);
    return NextResponse.json(response, { status });
  }
}
