"use client";

import { useState, useRef, useEffect, useCallback, MouseEvent } from "react";

interface CropOverlayProps {
  imageUrl: string;
  cropParams: {
    x: number;
    y: number;
    size: number;
  };
  onCropChange: (params: { x: number; y: number; size: number }) => void;
  imageDimensions: {
    width: number;
    height: number;
  };
  maxDisplayWidth?: number;
  maxDisplayHeight?: number;
}

export default function CropOverlay({
  imageUrl,
  cropParams,
  onCropChange,
  imageDimensions,
  maxDisplayWidth = 600,
  maxDisplayHeight = 400,
}: CropOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate display dimensions and scale
  useEffect(() => {
    if (imageDimensions.width === 0 || imageDimensions.height === 0) return;

    const aspectRatio = imageDimensions.width / imageDimensions.height;
    let displayWidth = imageDimensions.width;
    let displayHeight = imageDimensions.height;

    // Scale down if image is too large
    if (displayWidth > maxDisplayWidth) {
      displayWidth = maxDisplayWidth;
      displayHeight = displayWidth / aspectRatio;
    }

    if (displayHeight > maxDisplayHeight) {
      displayHeight = maxDisplayHeight;
      displayWidth = displayHeight * aspectRatio;
    }

    const newScale = displayWidth / imageDimensions.width;

    setDisplayDimensions({ width: displayWidth, height: displayHeight });
    setScale(newScale);
  }, [imageDimensions, maxDisplayWidth, maxDisplayHeight]);

  // Convert image coordinates to display coordinates
  const imageToDisplay = useCallback((coord: number) => coord * scale, [scale]);
  const displayToImage = useCallback((coord: number) => coord / scale, [scale]);

  // Handle mouse down on crop area (start dragging)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({
      x: x - imageToDisplay(cropParams.x),
      y: y - imageToDisplay(cropParams.y),
    });
  };

  // Handle mouse down on resize handle
  const handleResizeMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDragStart({ x, y });
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isDragging) {
        // Calculate new position
        const newX = displayToImage(x - dragStart.x);
        const newY = displayToImage(y - dragStart.y);

        // Constrain to image bounds
        const constrainedX = Math.max(
          0,
          Math.min(newX, imageDimensions.width - cropParams.size)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, imageDimensions.height - cropParams.size)
        );

        onCropChange({
          x: constrainedX,
          y: constrainedY,
          size: cropParams.size,
        });
      } else if (isResizing) {
        // Calculate new size based on distance from crop origin
        const cropDisplayX = imageToDisplay(cropParams.x);
        const cropDisplayY = imageToDisplay(cropParams.y);

        const deltaX = x - cropDisplayX;
        const deltaY = y - cropDisplayY;

        // Use the larger delta to maintain square proportions
        const newDisplaySize = Math.max(deltaX, deltaY);
        const newSize = displayToImage(newDisplaySize);

        // Constrain size
        const maxSize = Math.min(
          imageDimensions.width - cropParams.x,
          imageDimensions.height - cropParams.y
        );
        const constrainedSize = Math.max(10, Math.min(newSize, maxSize));

        onCropChange({
          x: cropParams.x,
          y: cropParams.y,
          size: constrainedSize,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    cropParams,
    imageDimensions,
    onCropChange,
    displayToImage,
    imageToDisplay,
  ]);

  if (displayDimensions.width === 0 || displayDimensions.height === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="position-relative d-inline-block"
      style={{
        width: displayDimensions.width,
        height: displayDimensions.height,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Crop preview"
        className="img-fluid"
        style={{
          width: displayDimensions.width,
          height: displayDimensions.height,
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* Crop overlay */}
      <div
        className="position-absolute"
        style={{
          left: imageToDisplay(cropParams.x),
          top: imageToDisplay(cropParams.y),
          width: imageToDisplay(cropParams.size),
          height: imageToDisplay(cropParams.size),
          border: "2px solid #007bff",
          backgroundColor: "rgba(0, 123, 255, 0.1)",
          cursor: isDragging ? "grabbing" : "grab",
          boxSizing: "border-box",
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize handle */}
        <div
          className="position-absolute"
          style={{
            right: -4,
            bottom: -4,
            width: 8,
            height: 8,
            backgroundColor: "#007bff",
            cursor: "nw-resize",
            border: "1px solid white",
          }}
          onMouseDown={handleResizeMouseDown}
        />

        {/* Corner indicators */}
        <div
          className="position-absolute"
          style={{
            left: -2,
            top: -2,
            width: 4,
            height: 4,
            backgroundColor: "#007bff",
            border: "1px solid white",
          }}
        />
        <div
          className="position-absolute"
          style={{
            right: -2,
            top: -2,
            width: 4,
            height: 4,
            backgroundColor: "#007bff",
            border: "1px solid white",
          }}
        />
        <div
          className="position-absolute"
          style={{
            left: -2,
            bottom: -2,
            width: 4,
            height: 4,
            backgroundColor: "#007bff",
            border: "1px solid white",
          }}
        />
      </div>

      {/* Dimmed overlay for non-crop areas */}
      <div
        className="position-absolute"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          pointerEvents: "none",
          clipPath: `polygon(
            0% 0%, 
            0% 100%, 
            ${
              (imageToDisplay(cropParams.x) / displayDimensions.width) * 100
            }% 100%, 
            ${
              (imageToDisplay(cropParams.x) / displayDimensions.width) * 100
            }% ${
            (imageToDisplay(cropParams.y) / displayDimensions.height) * 100
          }%, 
            ${
              ((imageToDisplay(cropParams.x) +
                imageToDisplay(cropParams.size)) /
                displayDimensions.width) *
              100
            }% ${
            (imageToDisplay(cropParams.y) / displayDimensions.height) * 100
          }%, 
            ${
              ((imageToDisplay(cropParams.x) +
                imageToDisplay(cropParams.size)) /
                displayDimensions.width) *
              100
            }% ${
            ((imageToDisplay(cropParams.y) + imageToDisplay(cropParams.size)) /
              displayDimensions.height) *
            100
          }%, 
            ${
              (imageToDisplay(cropParams.x) / displayDimensions.width) * 100
            }% ${
            ((imageToDisplay(cropParams.y) + imageToDisplay(cropParams.size)) /
              displayDimensions.height) *
            100
          }%, 
            ${
              (imageToDisplay(cropParams.x) / displayDimensions.width) * 100
            }% 100%, 
            100% 100%, 
            100% 0%
          )`,
        }}
      />
    </div>
  );
}
