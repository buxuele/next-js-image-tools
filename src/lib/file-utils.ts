// File handling utilities

export function getFileExtension(filename: string): string {
  return filename.toLowerCase().substring(filename.lastIndexOf("."));
}

export function getFileNameWithoutExtension(filename: string): string {
  return filename.substring(0, filename.lastIndexOf("."));
}

export function sortFilesByName(files: File[]): File[] {
  return [...files].sort((a, b) => a.name.localeCompare(b.name));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function createDownloadLink(
  data: string,
  filename: string,
  mimeType: string
): void {
  const link = document.createElement("a");
  link.href = `data:${mimeType};base64,${data}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result));
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

export function generateUniqueFilename(
  originalName: string,
  suffix?: string
): string {
  const timestamp = Date.now();
  const extension = getFileExtension(originalName);
  const nameWithoutExt = getFileNameWithoutExtension(originalName);

  if (suffix) {
    return `${nameWithoutExt}_${suffix}_${timestamp}${extension}`;
  }

  return `${nameWithoutExt}_${timestamp}${extension}`;
}
