import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { shareToSMS } from '../lib/share';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  QrCode,
  Sparkles,
  ExternalLink,
  Download,
  Smartphone,
  Info,
  MessageSquareText,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
  description?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const qrRef = useRef<SVGSVGElement>(null);

  if (!isOpen) return null;

  const defaultAppUrl = 'https://ais-pre-3s2u2366exahnrl4g3ehii-473104198394.europe-west3.run.app';
  const shareUrl = url || defaultAppUrl;
  const shareTitle = title || (language === 'ar' ? 'منصة OMS الشاملة لأسعار الصرف والعقارات والسيارات في سوريا' : 'OMS Platform - Currency, Real Estate & Classifieds');
  const shareText = description || (language === 'ar' ? 'تابع أسعار الصرف، أسعار الذهب، العقارات، والمعدات المستعملة والتكسي المباشر عبر منصة OMS:' : 'Check out live Syrian currency rates, real estate, and car listings on OMS Platform:');

  const fullShareMessage = `${shareTitle}\n${shareText}\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 300, 300);
        ctx.drawImage(img, 25, 25, 250, 250);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `OMS_Listing_QR_${Date.now()}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        console.log('Share dismissed', e);
      }
    } else {
      handleCopy();
    }
  };

  const shareOptions = [
    {
      name: 'رسالة نصية SMS',
      icon: <MessageSquareText className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-950/80 border-amber-500/40 text-amber-200 hover:bg-amber-900',
      action: () => {
        shareToSMS(shareTitle, shareText, shareUrl);
      },
    },
    {
      name: 'واتساب WhatsApp',
      icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`, '_blank');
      },
    },
    {
      name: 'تلغرام Telegram',
      icon: <Send className="w-4 h-4 text-sky-400" />,
      color: 'bg-sky-950/80 border-sky-500/40 text-sky-200 hover:bg-sky-900',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
      },
    },
    {
      name: 'فيسبوك Facebook',
      icon: <Facebook className="w-4 h-4 text-blue-400" />,
      color: 'bg-blue-950/80 border-blue-500/40 text-blue-200 hover:bg-blue-900',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      },
    },
    {
      name: 'تويتر X',
      icon: <Twitter className="w-4 h-4 text-slate-300" />,
      color: 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
      },
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl space-y-4 p-5 text-slate-100 max-h-[92vh] overflow-y-auto scrollbar-none my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                <span>{language === 'ar' ? 'رمز QR ومشاركة الإعلان' : 'Listing QR Code & Share'}</span>
              </h3>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {title || (language === 'ar' ? 'انشر رابط منصة OMS مع أصدقائك' : 'Spread the OMS platform link')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Canvas Card */}
        {showQr && (
          <div className="bg-slate-950 border border-amber-500/30 p-4 rounded-2xl flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="bg-white p-3.5 rounded-2xl shadow-xl border-2 border-amber-500/50 flex items-center justify-center">
              <QRCodeSVG
                ref={qrRef}
                value={shareUrl}
                size={160}
                bgColor="#ffffff"
                fgColor="#090d16"
                level="H"
                marginSize={1}
              />
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-white">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'امسح الرمز بكاميرا الجوال للوصول السريع' : 'Scan with mobile camera to view'}</span>
              </div>
              <p className="text-[10px] text-slate-400 max-w-xs">
                {language === 'ar' ? 'رمز QR فريد وخاص بهذا الإعلان يسهل مشاركته أو طباعته للمشترين.' : 'Unique QR code generated locally for fast scanning and offline printing.'}
              </p>
            </div>

            <button
              onClick={handleDownloadQR}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'حفظ صورة الكود (PNG) 📥' : 'Download QR Image (PNG) 📥'}</span>
            </button>
          </div>
        )}

        {/* Dynamic Share Box */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{title ? (language === 'ar' ? 'رابط الإعلان' : 'Listing Link') : (language === 'ar' ? 'رابط OMS الرسمي' : 'Official OMS Link')}</span>
            </span>
            <button
              onClick={() => setShowQr(!showQr)}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 cursor-pointer"
            >
              <QrCode className="w-3 h-3" />
              <span>{showQr ? (language === 'ar' ? 'إخفاء كود QR' : 'Hide QR') : (language === 'ar' ? 'عرض كود QR' : 'Show QR')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-emerald-400 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Quick Social Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            {language === 'ar' ? 'إرسال مباشر عبر وسائل التواصل:' : 'Direct Share via Social Apps:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {shareOptions.map((opt, i) => (
              <button
                key={i}
                onClick={opt.action}
                className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${opt.color}`}
              >
                {opt.icon}
                <span className="truncate">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Native Web Share API Button */}
        <button
          onClick={handleNativeShare}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'ar' ? 'فتح في خيارات المشاركة بالنظام' : 'Open System Share Sheet'}</span>
        </button>
      </div>
    </div>
  );
};

