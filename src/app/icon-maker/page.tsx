"use client";

import { useState, useRef, useEffect } from "react";

import CropOverlay from "@/components/image/CropOverlay";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addMessage } = useFlashMessages();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length !== 1) {
      addMessage("error", "请选择一张图片来制作图标。");
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

    // Set initial crop to 60% of image height (square)
    const size = Math.min(height * 0.6, width * 0.6);
    const x = (width - size) / 2;
    const y = (height - size) / 2;

    setCropParams({ x, y, size });
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      addMessage("error", "请先选择一张图片。");
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
        addMessage("success", "图标生成成功！");
      } else {
        addMessage("error", result.error || "图标生成失败。");
      }
    } catch (error) {
      console.error("Error generating icons:", error);
      addMessage("error", "生成图标时发生错误。");
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

  return (
    <>
      {/* Main content */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">图标制作</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  上传图片并裁剪以创建PNG和ICO格式的图标。
                </p>

                <div className="mb-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    选择图片
                  </button>
                </div>

                {imageUrl && (
                  <div className="row">
                    <div className="col-md-8">
                      <h6>原始图片及裁剪选择:</h6>
                      <div className="mb-3">
                        {/* Hidden image for loading and canvas reference */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="Original"
                          style={{ display: "none" }}
                          onLoad={handleImageLoad}
                        />

                        {imageDimensions.width > 0 &&
                          imageDimensions.height > 0 && (
                            <CropOverlay
                              imageUrl={imageUrl}
                              cropParams={cropParams}
                              onCropChange={setCropParams}
                              imageDimensions={imageDimensions}
                              maxDisplayWidth={600}
                              maxDisplayHeight={400}
                            />
                          )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <h6>
                        预览 ({ICON_SETTINGS.PREVIEW_SIZE}×
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
                              生成中...
                            </>
                          ) : (
                            "生成图标"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {resultImages && (
                  <div className="mt-4">
                    <h5>生成的图标:</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body text-center">
                            <h6>PNG 格式</h6>
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
                              下载 PNG
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card">
                          <div className="card-body text-center">
                            <h6>ICO 格式</h6>
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
                              下载 ICO
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
