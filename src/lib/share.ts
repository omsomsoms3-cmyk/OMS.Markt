// Web Share API Utility for sharing individual listings via native share dialog or fallback

export interface ShareDataInput {
  title: string;
  text?: string;
  url?: string;
}

export async function shareListingItem(data: ShareDataInput): Promise<{ success: boolean; method: 'native' | 'clipboard' }> {
  const shareUrl = data.url || window.location.href;
  const shareText = data.text ? `${data.title}\n${data.text}\n` : `${data.title}\n`;

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: shareText,
        url: shareUrl,
      });
      return { success: true, method: 'native' };
    } catch (err: any) {
      // User cancelled or aborted native share
      if (err.name === 'AbortError') {
        return { success: false, method: 'native' };
      }
      console.warn('Native navigator.share failed, falling back to clipboard:', err);
    }
  }

  // Fallback to Clipboard Copy
  try {
    const fullText = `${shareText}${shareUrl}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(fullText);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return { success: true, method: 'clipboard' };
  } catch (clipboardErr) {
    console.error('Clipboard fallback failed:', clipboardErr);
    return { success: false, method: 'clipboard' };
  }
}

export function shareToWhatsApp(title: string, text?: string, url?: string) {
  const shareUrl = url || window.location.href;
  const fullText = text ? `*${title}*\n${text}\n${shareUrl}` : `*${title}*\n${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

export function shareToTelegram(title: string, text?: string, url?: string) {
  const shareUrl = url || window.location.href;
  const fullText = text ? `${title}\n${text}` : title;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullText)}`;
  window.open(telegramUrl, '_blank', 'noopener,noreferrer');
}

export function shareToSMS(title: string, text?: string, url?: string) {
  const shareUrl = url || window.location.href;
  const fullText = text ? `${title}\n${text}\n${shareUrl}` : `${title}\n${shareUrl}`;
  const smsUrl = `sms:?body=${encodeURIComponent(fullText)}`;
  window.open(smsUrl, '_self');
}

