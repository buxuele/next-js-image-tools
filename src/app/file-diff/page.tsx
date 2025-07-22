"use client";

import { useState } from "react";
import { useFlashMessages } from "@/components/ui/FlashMessageProvider";

export default function FileDiffPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffResult, setDiffResult] = useState<string | null>(null);
  const { addMessage } = useFlashMessages();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length !== 2) {
      addMessage("error", "请选择2个文件进行比较。");
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
    setDiffResult(null); // Clear previous result
  };

  const handleCompare = async () => {
    if (selectedFiles.length !== 2) {
      addMessage("error", "请在比较前选择2个文件。");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file1", selectedFiles[0]);
      formData.append("file2", selectedFiles[1]);

      const response = await fetch("/api/file-diff", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setDiffResult(result.data.diff);
        addMessage("success", "文件比较成功！");
      } else {
        addMessage("error", result.error || "文件比较失败。");
      }
    } catch (error) {
      console.error("Error comparing files:", error);
      addMessage("error", "比较文件时发生错误。");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setDiffResult(null);
  };

  return (
    <>
      {/* Main content */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">文件对比</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">选择2个文本文件来比较它们的差异。</p>

                <div className="mb-3">
                  <label htmlFor="fileInput" className="form-label">
                    选择文件:
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    className="form-control"
                    multiple
                    accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.xml,.json,.yaml,.yml"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">
                    支持的文本文件: TXT, MD, JS, TS, JSX, TSX, PY, JAVA, CPP, C,
                    H, CSS, HTML, XML, JSON, YAML, YML
                  </small>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <h6>已选择文件:</h6>
                    <div className="list-group">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>文件 {index + 1}:</strong> {file.name}
                            <small className="text-muted ms-2">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeFile(index)}
                          >
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-custom"
                  disabled={selectedFiles.length !== 2 || isProcessing}
                  onClick={handleCompare}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      比较中...
                    </>
                  ) : (
                    "比较文件"
                  )}
                </button>

                {diffResult && (
                  <div className="mt-4">
                    <h5>比较结果:</h5>
                    <div
                      className="border p-3"
                      style={{
                        backgroundColor: "#f8f9fa",
                        maxHeight: "600px",
                        overflowY: "auto",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                      }}
                      dangerouslySetInnerHTML={{ __html: diffResult }}
                    />
                    <div className="mt-3">
                      <small className="text-muted">
                        <strong>图例:</strong>
                        <span
                          className="ms-2"
                          style={{
                            backgroundColor: "#d4edda",
                            padding: "2px 4px",
                          }}
                        >
                          绿色 = 新增
                        </span>
                        <span
                          className="ms-2"
                          style={{
                            backgroundColor: "#f8d7da",
                            padding: "2px 4px",
                          }}
                        >
                          红色 = 删除
                        </span>
                        <span
                          className="ms-2"
                          style={{
                            backgroundColor: "#fff3cd",
                            padding: "2px 4px",
                          }}
                        >
                          黄色 = 修改
                        </span>
                      </small>
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
