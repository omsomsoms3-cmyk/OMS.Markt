import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, ShieldAlert, Sparkles, SwitchCamera, Upload } from 'lucide-react';

interface CameraAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (photoDataUrl: string) => Promise<void> | void;
  currentPhotoURL?: string;
}

export const CameraAvatarModal: React.FC<CameraAvatarModalProps> = ({
  isOpen,
  onClose,
  onSaveAvatar,
  currentPhotoURL,
}) => {
  const { language } = useLanguage();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Start live camera WebRTC
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    setCameraError(null);
    stopCameraStream();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          language === 'ar'
            ? 'تم رفض الإذن لاستخدام الكاميرا. يرجى السماح بالوصول للكاميرا من إعدادات المتصفح'
            : 'Camera permission denied. Please allow camera access in your browser settings'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError(
          language === 'ar'
            ? 'لم يتم العثور على كاميرا في هذا الجهاز. يمكنك اختيار صورة من المعرض'
            : 'No camera device found. You can choose a photo from your gallery'
        );
      } else {
        setCameraError(
          language === 'ar'
            ? 'تعذر تشغيل الكاميرا المباشرة. يمكنك استخدام خيار رفع الصورة من المعرض'
            : 'Unable to start live camera stream. You can pick an image file instead'
        );
      }
    }
  };

  useEffect(() => {
    if (isOpen && isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, isCameraActive, stream]);

  // Clean up on modal close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setCapturedImage(null);
      setCameraError(null);
    }
  }, [isOpen]);

  // Snap photo from video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop to square
    const startX = ((video.videoWidth || 400) - size) / 2;
    const startY = ((video.videoHeight || 400) - size) / 2;

    // Flip horizontally if front camera for mirror effect
    if (facingMode === 'user') {
      ctx.translate(400, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCameraStream();
  };

  // Switch facing mode (Front / Back camera)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handle mobile camera / file upload input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedImage(dataUrl);
        stopCameraStream();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save captured avatar
  const handleSave = async () => {
    if (!capturedImage) return;
    setIsSaving(true);
    try {
      await onSaveAvatar(capturedImage);
      onClose();
    } catch (e) {
      console.error('Failed to save avatar:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 relative overflow-hidden dir-rtl">
        {/* Top Glow bar */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hidden Canvas and File Input */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          type="file"
          accept="image/*"
          capture="user"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Title Header */}
        <div className="text-right space-y-1 pr-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <span>{language === 'ar' ? 'تحديث الصورة الشخصية' : 'Update Profile Photo'}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {language === 'ar'
              ? 'التقط صورة مباشرة بكاميرا جوالك أو اختر من المعرض لتأكيد هويتك'
              : 'Take a photo with your mobile camera or choose from your photo gallery'}
          </p>
        </div>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="bg-red-950/60 border border-red-500/40 p-3 rounded-2xl flex items-start gap-2 text-xs text-red-300">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Main Display Area */}
        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center aspect-square shadow-inner">
          {capturedImage ? (
            /* Snap Preview State */
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured Avatar Preview"
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute inset-0 border-4 border-amber-400/60 rounded-2xl pointer-events-none"></div>
              <span className="absolute top-3 right-3 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                <span>{language === 'ar' ? 'معاينة الصورة' : 'Preview'}</span>
              </span>
            </div>
          ) : isCameraActive ? (
            /* Live WebRTC Stream State */
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-2xl ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {/* Circular Face Alignment Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 rounded-full border-2 border-dashed border-amber-400/80 bg-amber-500/5 shadow-2xl flex items-center justify-center">
                  <span className="text-[10px] text-amber-300/80 font-bold bg-slate-950/70 px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'ضع وجهك داخل الإطار' : 'Align face here'}
                  </span>
                </div>
              </div>

              {/* Camera Switcher Button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                title={language === 'ar' ? 'تبديل الكاميرا (أمامية / خلفية)' : 'Switch Camera'}
                className="absolute top-3 left-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 p-2 rounded-xl transition-all cursor-pointer active:scale-90"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Default / Initial State */
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 overflow-hidden bg-slate-900 flex items-center justify-center shadow-md relative group">
                {currentPhotoURL ? (
                  <img
                    src={currentPhotoURL}
                    alt="Current Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-amber-400/70" />
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-[200px]">
                {language === 'ar'
                  ? 'انقر أسفله لفتح الكاميرا فوراً أو اختيار صورة'
                  : 'Tap below to launch camera or upload a photo'}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          {capturedImage ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-slate-700"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'إعادة الالتقاط' : 'Retake'}</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSaving
                    ? language === 'ar'
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : language === 'ar'
                      ? 'حفظ كصورة شخصية'
                      : 'Save Avatar'}
                </span>
              </button>
            </div>
          ) : isCameraActive ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'ar' ? 'التقاط الصورة الآن 📸' : 'Take Snap Now 📸'}</span>
              </button>
              <button
                type="button"
                onClick={stopCameraStream}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-bold text-xs cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Take Photo with Camera Button */}
              <button
                type="button"
                onClick={() => startCamera('user')}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'ar' ? 'تشغيل كاميرا الجوال المباشرة 📷' : 'Launch Mobile Camera 📷'}</span>
              </button>

              {/* Upload / Pick File Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'رفع صورة من الجهاز / المعرض 🖼️' : 'Upload from Device / Gallery 🖼️'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
