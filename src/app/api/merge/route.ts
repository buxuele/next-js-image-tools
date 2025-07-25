import { NextRequest, NextResponse } from "next/server";
import {
  createCanvas,
  loadImage,
  Canvas,
  CanvasRenderingContext2D,
} from "canvas";
import { validateImageMergeFiles } from "@/lib/validation";
import { DUAL_MERGE_LABELS, GRID_LAYOUTS } from "@/lib/constants";
import { MergeDirection } from "@/lib/types";
import {
  handleApiError,
  ValidationError,
  ImageProcessingError,
} from "@/lib/errors";

interface ImageInfo {
  buffer: Buffer;
  width: number;
  height: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract files and options
    const fileCount = parseInt(formData.get("fileCount") as string);
    const mergeDirection =
      (formData.get("mergeDirection") as MergeDirection) || "horizontal";
    const addTextLabels = formData.get("addTextLabels") === "true";

    if (!fileCount || fileCount < 2 || fileCount > 6) {
      throw new ValidationError("请提供2到6张图片进行拼接。");
    }

    const files: File[] = [];
    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File;
      if (!file) {
        throw new ValidationError(`缺少第${i + 1}张图片。`);
      }
      files.push(file);
    }

    // Validate files
    const validation = validateImageMergeFiles(files);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors.join(", "));
    }

    // Load images using Canvas
    const images: ImageInfo[] = [];

    try {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const img = await loadImage(buffer);
        images.push({
          buffer,
          width: img.width,
          height: img.height,
        });
      }
    } catch (error) {
      throw new ImageProcessingError("加载图片失败。");
    }

    // Calculate canvas dimensions based on merge direction
    let canvasWidth: number;
    let canvasHeight: number;
    let labelHeight = 0;

    if (addTextLabels && fileCount === 2 && mergeDirection === "horizontal") {
      labelHeight = 40;
    }

    if (mergeDirection === "horizontal") {
      // For horizontal: same height, sum widths
      const targetHeight = Math.min(...images.map((img) => img.height));
      canvasHeight = targetHeight + labelHeight;

      // Calculate proportional widths
      canvasWidth = images.reduce((sum, img) => {
        const proportionalWidth = (img.width * targetHeight) / img.height;
        return sum + proportionalWidth;
      }, 0);
    } else if (mergeDirection === "vertical") {
      // For vertical: same width, sum heights
      const targetWidth = Math.min(...images.map((img) => img.width));
      canvasWidth = targetWidth;

      // Calculate proportional heights
      canvasHeight = images.reduce((sum, img) => {
        const proportionalHeight = (img.height * targetWidth) / img.width;
        return sum + proportionalHeight;
      }, 0);
    } else {
      // Grid layout
      const layout = GRID_LAYOUTS[fileCount as keyof typeof GRID_LAYOUTS];
      if (!layout) {
        throw new ValidationError("不支持的图片数量。");
      }

      const maxWidth = Math.max(...images.map((img) => img.width));
      const maxHeight = Math.max(...images.map((img) => img.height));

      const cellWidth = Math.min(maxWidth, 400);
      const cellHeight = Math.min(maxHeight, 400);

      canvasWidth = cellWidth * layout.cols;
      canvasHeight = cellHeight * layout.rows;
    }

    // Create canvas
    const canvas = createCanvas(
      Math.floor(canvasWidth),
      Math.floor(canvasHeight)
    );
    const ctx = canvas.getContext("2d");

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw images based on merge direction
    try {
      if (mergeDirection === "horizontal") {
        const targetHeight = Math.min(...images.map((img) => img.height));
        let currentX = 0;

        // Draw text labels if requested
        if (addTextLabels && fileCount === 2) {
          ctx.fillStyle = "black";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";

          const img1Width = (images[0].width * targetHeight) / images[0].height;
          const img2Width = (images[1].width * targetHeight) / images[1].height;

          ctx.fillText(DUAL_MERGE_LABELS.BEFORE, img1Width / 2, 25);
          ctx.fillText(DUAL_MERGE_LABELS.AFTER, img1Width + img2Width / 2, 25);
        }

        // Draw images
        for (let i = 0; i < images.length; i++) {
          const img = await loadImage(images[i].buffer);
          const scaledWidth =
            (images[i].width * targetHeight) / images[i].height;

          ctx.drawImage(img, currentX, labelHeight, scaledWidth, targetHeight);

          currentX += scaledWidth;
        }
      } else if (mergeDirection === "vertical") {
        const targetWidth = Math.min(...images.map((img) => img.width));
        let currentY = 0;

        for (let i = 0; i < images.length; i++) {
          const img = await loadImage(images[i].buffer);
          const scaledHeight =
            (images[i].height * targetWidth) / images[i].width;

          ctx.drawImage(img, 0, currentY, targetWidth, scaledHeight);

          currentY += scaledHeight;
        }
      } else {
        // Grid layout
        const layout = GRID_LAYOUTS[fileCount as keyof typeof GRID_LAYOUTS];
        const cellWidth = canvasWidth / layout.cols;
        const cellHeight = canvasHeight / layout.rows;

        for (let i = 0; i < images.length; i++) {
          const img = await loadImage(images[i].buffer);
          const row = Math.floor(i / layout.cols);
          const col = i % layout.cols;

          // Calculate scaled dimensions to fit in cell
          const scaleX = cellWidth / images[i].width;
          const scaleY = cellHeight / images[i].height;
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = images[i].width * scale;
          const scaledHeight = images[i].height * scale;

          // Center in cell
          const x = col * cellWidth + (cellWidth - scaledWidth) / 2;
          const y = row * cellHeight + (cellHeight - scaledHeight) / 2;

          ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        }
      }
    } catch (error) {
      throw new ImageProcessingError("绘制图片失败。");
    }

    // Convert canvas to buffer and then to base64
    const buffer = canvas.toBuffer("image/png");
    const base64Image = buffer.toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        image: base64Image,
        filename: `merged_${fileCount}_${mergeDirection}_${Date.now()}.png`,
        mimeType: "image/png",
        mergeDirection,
        dimensions: `${Math.floor(canvasWidth)}x${Math.floor(canvasHeight)}`,
      },
    });
  } catch (error) {
    const { response, status } = handleApiError("image-merge", error);
    return NextResponse.json(response, { status });
  }
}
