"use client";

import { useState, useRef, useEffect } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { useFlashMessages } from "@/components/ui/FlashMessageProvider";
import { createDownloadLink } from "@/lib/file-utils";
import { ICON_SETTINGS } from "@/lib/constants";

export default function IconMakerPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImages, setResultImages] = useState<{
    png: string;
    ico: string;
  } | null>(null);
  const [cropParams, setCropParams] = useState({
    x: 0,
    y: 0,
    size: ICON_SETTINGS.DEFAULT_CROP_SIZE,
  });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { addMessage } = useFlashMessages();

  const handleFilesSelected = (files: File[]) => {
    if (files.length !== 1) {
      addMessage("error", "Please select exactly 1 image for icon creation.");
      return;
    }

    const file = files[0];
    setSelectedFile(file);
    setResultImages(null);

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  };

  // Update preview canvas when crop parameters change
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas size
    canvas.width = ICON_SETTINGS.PREVIEW_SIZE;
    canvas.height = ICON_SETTINGS.PREVIEW_SIZE;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw cropped image
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(
        img,
        cropParams.x,
        cropParams.y,
        cropParams.size,
        cropParams.size,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }, [imageUrl, cropParams]);

  // Handle image load to set initial dimensions and crop
  const handleImageLoad = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    setImageDimensions({ width, height });

    // Set initial crop to center square
    const minDimension = Math.min(width, height);
    const size = Math.min(minDimension, ICON_SETTINGS.DEFAULT_CROP_SIZE);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCropParams({ x, y, size });
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      addMessage("error", "Please select an image first.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("x", cropParams.x.toString());
      formData.append("y", cropParams.y.toString());
      formData.append("size", cropParams.size.toString());

      const response = await fetch("/api/icon-maker", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultImages({
          png: result.data.png,
          ico: result.data.ico,
        });
        addMessage("success", "Icons generated successfully!");
      } else {
        addMessage("error", result.error || "Failed to generate icons.");
      }
    } catch (error) {
      console.error("Error generating icons:", error);
      addMessage("error", "An error occurred while generating icons.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPng = () => {
    if (resultImages?.png) {
      createDownloadLink(
        resultImages.png,
        `icon_${Date.now()}.png`,
        "image/png"
      );
    }
  };

  const handleDownloadIco = () => {
    if (resultImages?.ico) {
      createDownloadLink(
        resultImages.ico,
        `icon_${Date.now()}.ico`,
        "image/x-icon"
      );
    }
  };

  const updateCropParam = (param: "x" | "y" | "size", value: number) => {
    setCropParams((prev) => {
      const newParams = { ...prev, [param]: value };

      // Ensure crop stays within image bounds
      if (newParams.x < 0) newParams.x = 0;
      if (newParams.y < 0) newParams.y = 0;
      if (newParams.size < 10) newParams.size = 10;

      if (newParams.x + newParams.size > imageDimensions.width) {
        newParams.x = imageDimensions.width - newParams.size;
      }
      if (newParams.y + newParams.size > imageDimensions.height) {
        newParams.y = imageDimensions.height - newParams.size;
      }

      return newParams;
    });
  };

  return (
    <>
      {/* Main content */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Icon Maker</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Upload an image and crop it to create PNG and ICO format
                  icons.
                </p>

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={1}
                  className="mb-4"
                />

                {imageUrl && (
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Original Image with Crop Selection:</h6>
                      <div className="position-relative d-inline-block mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="Original"
                          className="img-fluid"
                          style={{ maxWidth: "100%", maxHeight: "400px" }}
                          onLoad={handleImageLoad}
                        />
                        {/* Crop overlay will be added in task 5.2 */}
                      </div>

                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">X Position:</label>
                          <input
                            type="range"
                            className="form-range"
                            min="0"
                            max={Math.max(
                              0,
                              imageDimensions.width - cropParams.size
                            )}
                            value={cropParams.x}
                            onChange={(e) =>
                              updateCropParam("x", parseInt(e.target.value))
                            }
                          />
                          <small className="text-muted">{cropParams.x}px</small>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Y Position:</label>
                          <input
                            type="range"
                            className="form-range"
                            min="0"
                            max={Math.max(
                              0,
                              imageDimensions.height - cropParams.size
                            )}
                            value={cropParams.y}
                            onChange={(e) =>
                              updateCropParam("y", parseInt(e.target.value))
                            }
                          />
                          <small className="text-muted">{cropParams.y}px</small>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Size:</label>
                          <input
                            type="range"
                            className="form-range"
                            min="10"
                            max={Math.min(
                              imageDimensions.width,
                              imageDimensions.height
                            )}
                            value={cropParams.size}
                            onChange={(e) =>
                              updateCropParam("size", parseInt(e.target.value))
                            }
                          />
                          <small className="text-muted">
                            {cropParams.size}px
                          </small>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <h6>
                        Preview ({ICON_SETTINGS.PREVIEW_SIZE}×
                        {ICON_SETTINGS.PREVIEW_SIZE}):
                      </h6>
                      <canvas
                        ref={canvasRef}
                        className="border"
                        style={{
                          width: `${ICON_SETTINGS.PREVIEW_SIZE}px`,
                          height: `${ICON_SETTINGS.PREVIEW_SIZE}px`,
                          maxWidth: "100%",
                        }}
                      />

                      <div className="mt-3">
                        <button
                          className="btn btn-primary btn-custom w-100"
                          disabled={!selectedFile || isProcessing}
                          onClick={handleGenerate}
                        >
                          {isProcessing ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Generating...
                            </>
                          ) : (
                            "Generate Icons"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {resultImages && (
                  <div className="mt-4">
                    <h5>Generated Icons:</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body text-center">
                            <h6>PNG Format</h6>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`data:image/png;base64,${resultImages.png}`}
                              alt="PNG Icon"
                              className="mb-3"
                              style={{
                                width: "128px",
                                height: "128px",
                                border: "1px solid #dee2e6",
                              }}
                            />
                            <br />
                            <button
                              className="btn btn-success btn-custom"
                              onClick={handleDownloadPng}
                            >
                              Download PNG
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body text-center">
                            <h6>ICO Format</h6>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`data:image/x-icon;base64,${resultImages.ico}`}
                              alt="ICO Icon"
                              className="mb-3"
                              style={{
                                width: "128px",
                                height: "128px",
                                border: "1px solid #dee2e6",
                              }}
                            />
                            <br />
                            <button
                              className="btn btn-success btn-custom"
                              onClick={handleDownloadIco}
                            >
                              Download ICO
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
