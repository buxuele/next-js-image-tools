"use client";

import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { useFlashMessages } from "@/components/ui/FlashMessageProvider";
import { createDownloadLink } from "@/lib/file-utils";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [addTextLabels, setAddTextLabels] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { addMessage } = useFlashMessages();

  const handleFilesSelected = (files: File[]) => {
    if (files.length !== 2) {
      addMessage("error", "请选择2张图片进行双图合并。");
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
    setResultImage(null); // Clear previous result
  };

  const handleMerge = async () => {
    if (selectedFiles.length !== 2) {
      addMessage("error", "请先选择2张图片再进行合并。");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file1", selectedFiles[0]);
      formData.append("file2", selectedFiles[1]);
      formData.append("addTextLabels", addTextLabels.toString());

      const response = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultImage(result.data.image);
        addMessage("success", "图片合并成功！");
      } else {
        addMessage("error", result.error || "图片合并失败。");
      }
    } catch (error) {
      console.error("Error merging images:", error);
      addMessage("error", "合并图片时发生错误。");
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
              <div className="card-header">
                <h4 className="mb-0">双图合并</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  选择2张图片进行左右合并，可选择添加文字标签。
                </p>

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={2}
                  className="mb-3"
                />

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="addTextLabels"
                    checked={addTextLabels}
                    onChange={(e) => setAddTextLabels(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="addTextLabels">
                    添加文字标签 (修改前 / 修改后)
                  </label>
                </div>

                <button
                  className="btn btn-primary btn-custom"
                  disabled={selectedFiles.length !== 2 || isProcessing}
                  onClick={handleMerge}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      处理中...
                    </>
                  ) : (
                    "合并图片"
                  )}
                </button>

                {resultImage && (
                  <div className="mt-4">
                    <h5>结果:</h5>
                    <div className="text-center mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`data:image/png;base64,${resultImage}`}
                        alt="合并结果"
                        className="img-fluid"
                        style={{
                          maxHeight: "600px",
                          border: "1px solid #dee2e6",
                          transform: "scale(1.5)",
                          transformOrigin: "center",
                          margin: "40px 0",
                        }}
                      />
                    </div>
                    <button
                      className="btn btn-success btn-custom"
                      onClick={handleDownload}
                    >
                      下载合并图片
                    </button>
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
