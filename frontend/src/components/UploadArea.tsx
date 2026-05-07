"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_MB = 10;

export default function UploadArea({ onFileSelected, disabled }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
      return "Please upload a JPEG, PNG, WebP, or HEIC image.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          upload-zone rounded-2xl p-6 sm:p-8 text-center cursor-pointer
          transition-all duration-300 min-h-[240px]
          flex flex-col items-center justify-center gap-4
          ${isDragOver ? "drag-over" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "active:scale-[0.98]"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="upload-zone-sheen" />

        {/* Card upload mark */}
        <motion.div
          animate={isDragOver ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`
            relative w-20 h-24 rounded-[18px] flex items-center justify-center
            transition-all duration-300 upload-icon-container
            ${isDragOver ? "upload-icon-active" : ""}
          `}
        >
          <div className="absolute top-3 left-3 right-3 h-2 rounded-full bg-white/12" />
          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1">
            <span className="h-1 rounded-full bg-white/10" />
            <span className="h-1 rounded-full bg-white/10" />
            <span className="h-1 rounded-full bg-white/10" />
          </div>
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? "text-white" : "text-white/70"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </motion.div>

        <div className="relative">
          <p className="text-white/95 font-semibold text-lg tracking-normal">
            {isDragOver ? "Drop Card" : "Upload Card"}
          </p>
        </div>

        <div className="relative flex items-center justify-center gap-2 pt-1">
          <span className="text-[10px] font-medium text-white/36 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
            JPG PNG WebP HEIC
          </span>
          <span className="text-[10px] text-white/28">Max {MAX_SIZE_MB}MB</span>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-3 text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
