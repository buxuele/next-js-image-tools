"use client";

import { useState } from "react";
import FileUpload from "@/components/ui/FileUpload";
import { useFlashMessages } from "@/components/ui/FlashMessageProvider";
import { createDownloadLink, sortFilesByName } from "@/lib/file-utils";

export default function MultiMergePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [addSequenceNumbers, setAddSequenceNumbers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const { addMessage } = useFlashMessages();

  const handleFilesSelected = (files: File[]) => {
    if (files.length < 2 || files.length > 6) {
      addMessage("error", "请选择2到6张图片进行多图合并。");
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
      addMessage("error", "请选择2到6张图片进行合并。");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      formData.append("fileCount", selectedFiles.length.toString());
      formData.append("addSequenceNumbers", addSequenceNumbers.toString());

      const response = await fetch("/api/multi-merge", {
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
      createDownloadLink(
        resultImage,
        `multi_merged_${Date.now()}.png`,
        "image/png"
      );
    }
  };

  const getLayoutDescription = (count: number) => {
    switch (count) {
      case 2:
        return "水平布局 (1×2)";
      case 3:
        return "垂直布局 (3×1)";
      case 4:
        return "网格布局 (2×2)";
      case 5:
        return "网格布局 (2×3, 1个空位)";
      case 6:
        return "网格布局 (2×3)";
      default:
        return "";
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
                <h4 className="mb-0">多图合并</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  选择2到6张图片进行布局合并。 图片将按文件名字母顺序排序。
                </p>

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={6}
                  className="mb-3"
                />

                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <h6>已选择文件 (合并顺序):</h6>
                    <div className="alert alert-info">
                      <strong>{selectedFiles.length} 张图片</strong> -{" "}
                      {getLayoutDescription(selectedFiles.length)}
                    </div>
                    <ol className="list-group list-group-numbered">
                      {selectedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-start"
                        >
                          <div className="ms-2 me-auto">
                            <div className="fw-bold">{file.name}</div>
                            <small className="text-muted">
                              位置 {index + 1}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="addSequenceNumbers"
                    checked={addSequenceNumbers}
                    onChange={(e) => setAddSequenceNumbers(e.target.checked)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="addSequenceNumbers"
                  >
                    添加序号 (1, 2, 3...)
                  </label>
                </div>

                <button
                  className="btn btn-primary btn-custom"
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
                        alt="Multi-merged result"
                        className="img-fluid"
                        style={{
                          maxHeight: "500px",
                          border: "1px solid #dee2e6",
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
