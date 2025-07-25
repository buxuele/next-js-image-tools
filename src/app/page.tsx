"use client";

import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { useFlashMessages } from "@/components/ui/FlashMessageProvider";
import { createDownloadLink, sortFilesByName } from "@/lib/file-utils";
import { MergeDirection } from "@/lib/types";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mergeDirection, setMergeDirection] =
    useState<MergeDirection>("horizontal");
  const [addTextLabels, setAddTextLabels] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { addMessage } = useFlashMessages();

  const handleFilesSelected = (files: File[]) => {
    if (files.length < 2 || files.length > 6) {
      addMessage("error", "请选择2到6张图片进行拼接。");
      setSelectedFiles([]);
      return;
    }

    // Sort files alphabetically by name
    const sortedFiles = sortFilesByName(files);
    setSelectedFiles(sortedFiles);
    setResultImage(null); // Clear previous result
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2 || selectedFiles.length > 6) {
      addMessage("error", "请选择2到6张图片进行拼接。");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      formData.append("fileCount", selectedFiles.length.toString());
      formData.append("mergeDirection", mergeDirection);
      formData.append("addTextLabels", addTextLabels.toString());

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultImage(result.data.image);
        addMessage("success", "图片拼接成功！");
      } else {
        addMessage("error", result.error || "图片拼接失败。");
      }
    } catch (error) {
      console.error("Error merging images:", error);
      addMessage("error", "拼接图片时发生错误。");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      createDownloadLink(resultImage, `merged_${Date.now()}.png`, "image/png");
    }
  };

  return (
    <>
      {/* Main content */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <div className="action-buttons">
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() =>
                      document.getElementById("hiddenFileInput")?.click()
                    }
                  >
                    <i className="bi bi-cloud-upload me-1"></i>
                    上传
                  </button>
                  <button
                    className="btn btn-success btn-sm me-2"
                    disabled={
                      selectedFiles.length < 2 ||
                      selectedFiles.length > 6 ||
                      isProcessing
                    }
                    onClick={handleMerge}
                  >
                    {isProcessing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        处理中
                      </>
                    ) : (
                      "拼接"
                    )}
                  </button>
                  {resultImage && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={handleDownload}
                    >
                      <i className="bi bi-download me-1"></i>
                      下载
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <input
                  type="file"
                  id="hiddenFileInput"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleFilesSelected(files);
                  }}
                />

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={6}
                  className="mb-3"
                />

                <div className="mb-3">
                  <h6>拼接方向:</h6>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="拼接方向选择"
                  >
                    <input
                      type="radio"
                      className="btn-check"
                      name="mergeDirection"
                      id="horizontal"
                      checked={mergeDirection === "horizontal"}
                      onChange={() => setMergeDirection("horizontal")}
                    />
                    <label
                      className="btn btn-outline-primary"
                      htmlFor="horizontal"
                    >
                      <i className="bi bi-arrow-left-right me-2"></i>
                      左右拼接
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="mergeDirection"
                      id="vertical"
                      checked={mergeDirection === "vertical"}
                      onChange={() => setMergeDirection("vertical")}
                    />
                    <label
                      className="btn btn-outline-primary"
                      htmlFor="vertical"
                    >
                      <i className="bi bi-arrow-up-down me-2"></i>
                      上下拼接
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="mergeDirection"
                      id="grid"
                      checked={mergeDirection === "grid"}
                      onChange={() => setMergeDirection("grid")}
                    />
                    <label className="btn btn-outline-primary" htmlFor="grid">
                      <i className="bi bi-grid-3x3-gap me-2"></i>
                      网格拼接
                    </label>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="addTextLabels"
                    checked={addTextLabels}
                    onChange={(e) => setAddTextLabels(e.target.checked)}
                    disabled={
                      selectedFiles.length !== 2 ||
                      mergeDirection !== "horizontal"
                    }
                  />
                  <label className="form-check-label" htmlFor="addTextLabels">
                    添加对比文字 (修改前 / 修改后)
                  </label>
                </div>

                {resultImage && (
                  <div className="mt-4">
                    <div className="result-container">
                      <div className="text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`data:image/png;base64,${resultImage}`}
                          alt="拼接结果"
                          className="img-fluid result-image"
                        />
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
