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
      addMessage(
        "error",
        "Please select between 2 and 6 images for multi merge."
      );
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
      addMessage(
        "error",
        "Please select between 2 and 6 images before merging."
      );
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
        addMessage("success", "Images merged successfully!");
      } else {
        addMessage("error", result.error || "Failed to merge images.");
      }
    } catch (error) {
      console.error("Error merging images:", error);
      addMessage("error", "An error occurred while merging images.");
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
        return "horizontal layout (1×2)";
      case 3:
        return "vertical layout (3×1)";
      case 4:
        return "grid layout (2×2)";
      case 5:
        return "grid layout (2×3, with 1 empty slot)";
      case 6:
        return "grid layout (2×3)";
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
                <h4 className="mb-0">Multi Image Merge</h4>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Select between 2 and 6 images to merge them in a layout.
                  Images will be sorted alphabetically by filename.
                </p>

                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={6}
                  className="mb-3"
                />

                {selectedFiles.length > 0 && (
                  <div className="mb-3">
                    <h6>Selected Files (in merge order):</h6>
                    <div className="alert alert-info">
                      <strong>{selectedFiles.length} images</strong> -{" "}
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
                              Position {index + 1}
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
                    Add sequence numbers (1, 2, 3...)
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
                      Processing...
                    </>
                  ) : (
                    "Merge Images"
                  )}
                </button>

                {resultImage && (
                  <div className="mt-4">
                    <h5>Result:</h5>
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
                      Download Merged Image
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
