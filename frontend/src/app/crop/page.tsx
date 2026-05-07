"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import UploadArea from "@/components/UploadArea";
import ProcessingStatus, {
  type ProcessingState,
} from "@/components/ProcessingStatus";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import CropAdjuster from "@/components/CropAdjuster";
import ActionBar from "@/components/ActionBar";
import StepIndicator, { type CropStep } from "@/components/StepIndicator";
import { cropImage, type CropImageResponse } from "@/lib/api";

type ViewMode = "upload" | "processing" | "result" | "adjust";
type RotationDirection = "left" | "right";

async function rotateImageDataUrl(
  imageUrl: string,
  direction: RotationDirection
): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not rotate image"));
    image.src = imageUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not rotate image");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (direction === "right") {
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
  } else {
    ctx.translate(0, canvas.height);
    ctx.rotate(-Math.PI / 2);
  }

  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

export default function CropPage() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [result, setResult] = useState<CropImageResponse | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [adjustedUrl, setAdjustedUrl] = useState<string | null>(null);

  const currentStep: CropStep =
    viewMode === "upload"
      ? "upload"
      : viewMode === "processing"
      ? "processing"
      : viewMode === "adjust"
      ? "adjust"
      : "export";

  const handleFileSelected = useCallback(async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);
    setResult(null);
    setAdjustedUrl(null);
    setError(null);
    setState("uploading");
    setViewMode("processing");

    try {
      setState("processing");
      const response = await cropImage(file);
      setResult(response);
      setState("complete");
      setViewMode("result");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setResult(null);
    setAdjustedUrl(null);
    setError(null);
    setState("idle");
    setViewMode("upload");
  }, [originalUrl]);

  const handleAdjustCrop = useCallback(() => {
    setViewMode("adjust");
  }, []);

  const handleCropComplete = useCallback((croppedUrl: string) => {
    setAdjustedUrl(croppedUrl);
    setViewMode("result");
  }, []);

  const handleRotate = useCallback(
    async (direction: RotationDirection) => {
      const imageUrl = adjustedUrl ?? result?.cropped_image;
      if (!imageUrl) return;

      try {
        const rotatedUrl = await rotateImageDataUrl(imageUrl, direction);
        setAdjustedUrl(rotatedUrl);
        setResult((current) =>
          current
            ? {
                ...current,
                cropped_size: [current.cropped_size[1], current.cropped_size[0]],
              }
            : current
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not rotate image";
        setError(message);
      }
    },
    [adjustedUrl, result?.cropped_image]
  );

  const handleSkipAdjust = useCallback(() => {
    setViewMode(result ? "result" : "processing");
  }, [result]);

  const isProcessing = state === "uploading" || state === "processing";
  const displayUrl = adjustedUrl ?? result?.cropped_image ?? null;
  const adjustImageUrl = displayUrl ?? originalUrl;
  const usedFallback = result?.detection_method === "center_fallback";

  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      {/* Animated glow blobs */}
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm mb-3 group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                <span className="text-white">Crop</span>{" "}
                <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
                  Tool
                </span>
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Auto-crop &amp; orient your baseball cards
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto">
          <StepIndicator currentStep={currentStep} />
        </div>
      </motion.div>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-4 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">
          <AnimatePresence mode="wait">
            {/* Upload area */}
            {viewMode === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="glass-hero upload-card-shell rounded-2xl p-5">
                  <UploadArea
                    onFileSelected={handleFileSelected}
                    disabled={isProcessing}
                  />
                </div>
              </motion.div>
            )}

            {/* Processing state */}
            {viewMode === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="space-y-4"
              >
                <ProcessingStatus state={state} error={error} />
                {originalUrl && (
                  <div className="glass-hero rounded-2xl p-3">
                    <div className="relative">
                      <img
                        src={originalUrl}
                        alt="Original card"
                        className={`w-full h-auto rounded-xl max-h-[50vh] object-contain mx-auto block ${
                          isProcessing ? "processing-image" : ""
                        }`}
                      />
                      <span className="absolute top-3 left-3 glass-strong text-xs font-medium px-2.5 py-1 rounded-lg text-white/70">
                        Original
                      </span>
                    </div>
                  </div>
                )}
                {state === "error" && (
                  <div className="flex gap-3">
                    {originalUrl && (
                      <button
                        onClick={handleAdjustCrop}
                        className="flex-1 py-3 rounded-xl font-semibold text-sm btn-cta active:scale-[0.97] transition-all duration-300 text-white"
                      >
                        Manual Crop
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 rounded-xl font-semibold text-sm glass-hero hover:bg-white/10 active:scale-[0.97] transition-all duration-300 text-white/80"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Result view with before/after slider */}
            {viewMode === "result" && originalUrl && displayUrl && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-4"
              >
                <ProcessingStatus state={state} error={error} />
                <BeforeAfterSlider
                  beforeUrl={originalUrl}
                  afterUrl={displayUrl}
                  confidence={result?.confidence}
                />
                {result && (
                  <div className="glass-hero rounded-2xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-white/80">
                        {usedFallback ? "Centered fallback crop" : "Edge-detected crop"}
                      </p>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        {result.cropped_size[0]}x{result.cropped_size[1]} PNG
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRotate("left")}
                        className="h-10 w-10 rounded-xl glass-hero hover:bg-white/10 active:scale-[0.95] transition-all duration-300 text-white/70 flex items-center justify-center"
                        aria-label="Rotate left"
                        title="Rotate left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v6h6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.64 17.66A7 7 0 1010 5.26L3 13" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRotate("right")}
                        className="h-10 w-10 rounded-xl glass-hero hover:bg-white/10 active:scale-[0.95] transition-all duration-300 text-white/70 flex items-center justify-center"
                        aria-label="Rotate right"
                        title="Rotate right"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7v6h-6" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.36 17.66A7 7 0 1114 5.26L21 13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                <ActionBar
                  processedUrl={displayUrl}
                  onReset={handleReset}
                  isProcessing={isProcessing}
                  onAdjustCrop={handleAdjustCrop}
                  showAdjust={!adjustedUrl}
                />
              </motion.div>
            )}

            {/* Crop adjuster view */}
            {viewMode === "adjust" && adjustImageUrl && (
              <motion.div
                key="adjust"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <CropAdjuster
                  imageUrl={adjustImageUrl}
                  onCropComplete={handleCropComplete}
                  onSkip={handleSkipAdjust}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </motion.footer>
    </div>
  );
}
