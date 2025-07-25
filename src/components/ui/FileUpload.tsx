"use client";

import React, { useRef, useState, useCallback } from "react";
import { FileUploadProps } from "@/lib/types";
import { validateImageFiles } from "@/lib/validation";
import { formatFileSize } from "@/lib/file-utils";
import { useFlashMessages } from "./FlashMessageProvider";

export default function FileUpload({
  onFilesSelected,
  acceptedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ],
  maxFiles = 10,
  maxFileSize = 64 * 1024 * 1024, // 64MB
  disabled = false,
  className = "",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { addMessage } = useFlashMessages();

  const handleFileValidation = useCallback(
    (files: File[]) => {
      const validation = validateImageFiles(files);

      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          addMessage("error", error);
        });
        return false;
      }

      if (files.length > maxFiles) {
        addMessage("error", `最多允许选择 ${maxFiles} 个文件。`);
        return false;
      }

      return true;
    },
    [maxFiles, addMessage]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      if (handleFileValidation(fileArray)) {
        setSelectedFiles(fileArray);
        onFilesSelected(fileArray);
        addMessage("success", `成功选择了 ${fileArray.length} 个文件。`);
      }
    },
    [handleFileValidation, onFilesSelected, addMessage]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  return (
    <div className={`file-upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
        disabled={disabled}
      />

      <div
        className={`file-upload-area compact ${isDragOver ? "dragover" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <i className="bi bi-cloud-upload fs-2 text-muted"></i>
          {disabled && <p className="mt-2 mb-0 text-muted">上传已禁用</p>}
        </div>
      </div>
    </div>
  );
}
