import React, { useState, useRef } from 'react';
import { Message } from '../types';
import { initialMessages } from '../data/mockData';
import { MessageSquare, Send, User, ShieldCheck, Trash2, RotateCcw, Mic, Image, Download, Square, Volume2, Paperclip, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePermissions } from '../context/PermissionContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { broadcastNotification } from '../lib/messaging';

export const MessagesSection: React.FC = () => {
  const { language } = useLanguage();
  const { requestPermission } = usePermissions();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  
  // Voice Recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<any>(null);
  const studioInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'single' | 'all';
    id?: string;
    textPreview?: string;
  } | null>(null);

  // Audio Recording On-Demand Action
  const handleStartAudioRecording = () => {
    requestPermission('microphone', () => {
      setIsRecordingAudio(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    });
  };

  const handleStopAudioRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecordingAudio(false);

    const voiceMsg: Message = {
      id: `voice-${Date.now()}`,
      sender: language === 'ar' ? 'أنت' : 'You',
      text: language === 'ar' ? `🎙️ تسجيل صوتي مباشر (${recordDuration} ثانية)` : `🎙️ Live Voice Recording (${recordDuration}s)`,
      timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, voiceMsg]);
    setRecordDuration(0);
  };

  // Studio / Gallery On-Demand Action
  const handleOpenStudioGallery = () => {
    requestPermission('studio', () => {
      if (studioInputRef.current) {
        studioInputRef.current.click();
      }
    });
  };

  const handleFilePickedFromStudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imgMsg: Message = {
        id: `img-${Date.now()}`,
        sender: language === 'ar' ? 'أنت' : 'You',
        text: language === 'ar' ? `🖼️ صورة مرفقة من الاستوديو: ${file.name}` : `🖼️ Attached Image from Gallery: ${file.name}`,
        timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };
      setMessages((prev) => [...prev, imgMsg]);
    }
  };

  // Video / Media Download On-Demand Action
  const handleDownloadVideoMedia = (fileName: string) => {
    requestPermission('video_download', () => {
      const blob = new Blob([`OMS Video Media Content: ${fileName}`], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OMS-Video-${fileName}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: language === 'ar' ? 'أنت' : 'You',
      text: input,
      timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // Auto reply mock
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: language === 'ar' ? 'خدمة العملاء OMS' : 'OMS Customer Support',
        text: language === 'ar'
          ? `تم استلام رسالتك: "${currentInput}". سيقوم أحد ممثلي الخدمة بالرد عليك خلال لحظات.`
          : `We received your message: "${currentInput}". A support representative will respond shortly.`,
        timestamp: new Date().toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        avatar: 'OMS',
      };
      setMessages((prev) => [...prev, autoReply]);
      broadcastNotification({
        title: language === 'ar' ? 'رسالة جديدة من خدمة العملاء OMS 💬' : 'New Reply from OMS Support 💬',
        body: autoReply.text,
        type: 'message_reply',
      });
    }, 1000);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single' && deleteTarget.id) {
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } else if (deleteTarget.type === 'all') {
      setMessages([]);
    }

    setDeleteTarget(null);
  };

  return (
    <div className="p-4 max-w-5xl w-full mx-auto space-y-4 flex flex-col h-[650px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-slate-800 dark:to-slate-900 border border-emerald-500/20 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 backdrop-blur-sm">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
            OMS
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>{language === 'ar' ? 'مركز المراسلات والدعم المباشر' : 'Messaging & Live Support'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'تواصل مباشر مع الدعم والتجار' : 'Direct channel with merchants and support'}
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() =>
              setDeleteTarget({
                type: 'all',
                textPreview: language === 'ar' ? 'جميع الرسائل في سجل المحادثة' : 'All messages in chat history',
              })
            }
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}</span>
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-3 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-700" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar' ? 'سجل المحادثة فارغ حالياً. اكتب رسالتك بالأسفل للبدء.' : 'Chat history is empty. Type below to start.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col group ${msg.isMe ? 'items-start' : 'items-end'}`}
            >
              <div className="relative max-w-md">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.isMe
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-emerald-500/15'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  {!msg.isMe && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mb-1">
                      {msg.sender}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 pt-1 border-t border-slate-200/40 dark:border-white/10 text-[9px] opacity-80">
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'single',
                          id: msg.id,
                          textPreview: msg.text,
                        })
                      }
                      title={language === 'ar' ? 'حذف هذه الرسالة' : 'Delete message'}
                      className="text-slate-400 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-300 p-0.5 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form with Permission-Protected Audio Recording & Studio Attachment */}
      <div className="space-y-2">
        {/* Hidden Studio File Input */}
        <input
          type="file"
          ref={studioInputRef}
          onChange={handleFilePickedFromStudio}
          accept="image/*,video/*"
          className="hidden"
        />

        {/* Recording Banner if Active */}
        {isRecordingAudio && (
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-amber-700 dark:text-amber-300 animate-pulse text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>
                {language === 'ar'
                  ? `جاري تسجيل الرسالة الصوتية (${recordDuration} ث)...`
                  : `Recording Voice Note (${recordDuration}s)...`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleStopAudioRecording}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-black hover:bg-red-500 cursor-pointer flex items-center gap-1 shadow"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>{language === 'ar' ? 'إيقاف وإرسال التسجيل' : 'Stop & Send'}</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-sm">
          {/* On-Demand Studio Attachment Button */}
          <button
            type="button"
            onClick={handleOpenStudioGallery}
            title={language === 'ar' ? 'الدخول للاستوديو واختيار صورة/فيديو (يتطلب إذن)' : 'Access Gallery / Studio (Requires Permission)'}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* On-Demand Audio Recording Button */}
          <button
            type="button"
            onClick={isRecordingAudio ? handleStopAudioRecording : handleStartAudioRecording}
            title={language === 'ar' ? 'تسجيل رسالة صوتية بالميكروفون (يتطلب إذن)' : 'Record Voice Note via Microphone (Requires Permission)'}
            className={`p-2 border rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 ${
              isRecordingAudio
                ? 'bg-red-600 text-white border-red-500 animate-bounce'
                : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* On-Demand Video Download Sample Button */}
          <button
            type="button"
            onClick={() => handleDownloadVideoMedia('OMS-Intro-Video')}
            title={language === 'ar' ? 'تنزيل مقطع فيديو توضيحي (يتطلب إذن)' : 'Download Intro Video Media (Requires Permission)'}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-bold"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px]">{language === 'ar' ? 'تنزيل فيديو' : 'Video DL'}</span>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'ar' ? 'اكتب رسالتك أو سجل صوتاً أو اختر من الاستوديو...' : 'Type message, record audio, or attach from gallery...'}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20"
          >
            <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </form>
      </div>

      {/* Confirmation Modal for Message Delete */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={
          deleteTarget?.type === 'all'
            ? language === 'ar' ? 'تأكيد مسح سجل المراسلات الكامل' : 'Confirm Clear Entire Chat'
            : language === 'ar' ? 'تأكيد حذف الرسالة' : 'Confirm Delete Message'
        }
        message={
          deleteTarget?.type === 'all'
            ? language === 'ar'
              ? 'هل أنت متأكد من رغبتك في حذف جميع الرسائل في سجل المحادثة؟ لا يمكن استعادة المحادثة بعد المسح.'
              : 'Are you sure you want to clear all messages in this conversation history?'
            : language === 'ar'
              ? 'هل أنت متأكد من رغبتك في حذف هذه الرسالة بشكل نهائي؟'
              : 'Are you sure you want to permanently delete this message?'
        }
        itemName={deleteTarget?.textPreview}
        confirmText={
          deleteTarget?.type === 'all'
            ? language === 'ar' ? 'نعم، امسح السجل' : 'Yes, Clear All'
            : language === 'ar' ? 'نعم، احذف الرسالة' : 'Yes, Delete Message'
        }
      />
    </div>
  );
};

