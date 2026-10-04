import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, AlertCircle } from 'lucide-react';
import {
  CustomCameraIcon,
  CustomCloseIcon,
  CustomCheckIcon,
} from './CustomIcons';
import { Attachment } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (attachment: Attachment) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Direct camera stream failed, falling back:', err);
      setCameraError(
        err?.message || 'Unable to access camera directly. You can use the device photo capture below.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;

    const newAttachment: Attachment = {
      id: `cam_${Date.now()}`,
      name: `Photo_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.jpg`,
      type: 'camera',
      mimeType: 'image/jpeg',
      dataUrl: capturedImage,
    };

    onCapture(newAttachment);
    onClose();
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      const newAttachment: Attachment = {
        id: `cam_file_${Date.now()}`,
        name: file.name,
        type: 'camera',
        mimeType: file.type || 'image/jpeg',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        dataUrl: result,
      };
      onCapture(newAttachment);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#0F1424] shadow-2xl max-h-[92dvh] flex flex-col pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-200">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
              <CustomCameraIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Camera Capture</h3>
              <p className="text-xs text-slate-400">Take a photo to attach to your instruction</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <CustomCloseIcon size={18} />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-video w-full bg-black/90 flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Captured"
              className="h-full w-full object-contain"
            />
          ) : cameraError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <AlertCircle className="mb-2 h-10 w-10 text-white" />
              <p className="text-sm font-medium text-slate-200">Camera Access Notice</p>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">{cameraError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-md transition-all hover:bg-slate-200"
              >
                Use Device Camera / Snap Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFallbackFile}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                  Initializing camera feed...
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-white" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-5 py-2 text-xs font-bold text-black shadow-md hover:bg-slate-200"
                >
                  <CustomCheckIcon size={16} className="text-black" />
                  <span>Attach Photo</span>
                </button>
              </>
            ) : (
              !cameraError && (
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-2xl bg-white px-6 py-2.5 text-xs font-bold text-black shadow-md transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-50"
                >
                  <div className="h-3 w-3 rounded-full bg-black animate-ping" />
                  <span>Snap Photo</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
