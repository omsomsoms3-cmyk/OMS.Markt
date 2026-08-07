import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useLanguage } from '../context/LanguageContext';
import { X, QrCode, Camera, Upload, Copy, ExternalLink, Search, RefreshCw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult?: (text: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanResult }) => {
  const { language } = useLanguage();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedResult(null);
      setScannerError(null);
      return;
    }

    startCamera();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setScannerError(null);
    setScannedResult(null);

    // Wait for DOM element
    setTimeout(async () => {
      const element = document.getElementById('qr-camera-reader');
      if (!element) return;

      try {
        if (scannerRef.current) {
          await stopScanner();
        }

        const html5Qrcode = new Html5Qrcode('qr-camera-reader');
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await html5Qrcode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            setScannedResult(decodedText);
            // Play a pleasant beep feedback if audio context is allowed
            try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              gain.gain.value = 0.1;
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
            } catch (e) {
              // ignore audio failure
            }

            if (onScanResult) {
              onScanResult(decodedText);
            }
            stopScanner();
          },
          (errorMessage) => {
            // parse errors are normal while seeking QR
          }
        );

        setIsCameraActive(true);
      } catch (err: any) {
        console.warn('QR Camera initialization error:', err);
        setIsCameraActive(false);
        setScannerError(
          language === 'ar'
            ? 'تعذر الوصول للكاميرا. يرجى السماح بتصريح الكاميرا أو رفع صورة QR بدلاً من ذلك.'
            : 'Could not access camera. Please grant camera permissions or upload a QR image.'
        );
      }
    }, 200);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping QR scanner:', e);
      }
      scannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerError(null);
      const html5Qrcode = new Html5Qrcode('qr-camera-reader');
      const result = await html5Qrcode.scanFile(file, true);
      setScannedResult(result);
      if (onScanResult) {
        onScanResult(result);
      }
    } catch (err) {
      setScannerError(
        language === 'ar'
          ? 'لم يتم العثور على رمز QR واضح في الصورة المختارة.'
          : 'No valid QR code found in the selected image.'
      );
    }
  };

  const handleCopy = () => {
    if (!scannedResult) return;
    navigator.clipboard.writeText(scannedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchResult = () => {
    if (!scannedResult) return;
    if (onScanResult) {
      onScanResult(scannedResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  const isUrl = scannedResult?.startsWith('http://') || scannedResult?.startsWith('https://');

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 relative text-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'ar' ? 'ماسح رمز الاستجابة السريعة (QR Code)' : 'QR Code Scanner'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'امسح رمز المنتجات، العروض أو الروابط فوراً' : 'Scan listing or product QR code directly'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed Container */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 min-h-[260px] flex items-center justify-center">
          <div id="qr-camera-reader" className="w-full h-full text-white"></div>

          {/* Target Reticle Overlay when scanning */}
          {isCameraActive && !scannedResult && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-52 h-52 border-2 border-amber-400/80 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-sm"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-sm"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-sm"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-sm"></div>
              </div>
            </div>
          )}

          {/* Scanner Error Display */}
          {scannerError && (
            <div className="absolute inset-0 bg-slate-950/90 p-4 flex flex-col items-center justify-center text-center gap-2 z-10">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-300 font-bold max-w-xs">{scannerError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إعادة المحاولة' : 'Retry Camera'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scanned Result Banner */}
        {scannedResult && (
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl space-y-2 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ar' ? 'تم قراءة الرمز بنجاح!' : 'QR Code Scanned!'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Ready</span>
            </div>

            <p className="text-xs text-white font-mono bg-slate-950 p-2.5 rounded-xl border border-slate-800 break-all select-all">
              {scannedResult}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ النص' : 'Copy')}</span>
              </button>

              <button
                type="button"
                onClick={handleSearchResult}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-md"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'بحث بهذا النص' : 'Search Item'}</span>
              </button>

              {isUrl && (
                <a
                  href={scannedResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'فتح الرابط' : 'Open URL'}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {/* Option to upload image from file gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>{language === 'ar' ? 'اختيار صورة QR' : 'Upload QR Image'}</span>
          </button>

          {scannedResult ? (
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>{language === 'ar' ? 'مسح رمز آخر' : 'Scan Another'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
