import React, { useState, useEffect, useRef } from 'react';

interface GoogleAdSenseSlotProps {
  client?: string;
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'banner' | 'vertical';
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * Smart Google AdSense Container
 * Automatically collapses and disappears (0px height, 0px margin) if Google has no ad to serve.
 * Displays seamlessly when a real Google ad is filled.
 */
export const GoogleAdSenseSlot: React.FC<GoogleAdSenseSlotProps> = ({
  client = 'ca-pub-1234567890123456',
  slotId = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  style,
}) => {
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled'>('loading');
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    // Try to trigger Google AdSense script initialization
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn('AdSense push error or adblocker detected:', e);
    }

    const insElem = adRef.current;
    if (!insElem) return;

    // Mutation observer to detect when Google AdSense injects ad or sets data-ad-status
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-ad-status') {
          const status = insElem.getAttribute('data-ad-status');
          if (status === 'filled') {
            setAdStatus('filled');
          } else if (status === 'unfilled') {
            setAdStatus('unfilled');
          }
        }
      });

      // Also check if an iframe with content was injected by Google
      const hasIframe = insElem.querySelector('iframe');
      if (hasIframe && insElem.getAttribute('data-ad-status') !== 'unfilled') {
        setAdStatus('filled');
      }
    });

    observer.observe(insElem, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // Fallback timer: If Google hasn't served an ad within 2 seconds, treat as unfilled and collapse
    const timer = setTimeout(() => {
      const currentStatus = insElem.getAttribute('data-ad-status');
      const hasIframe = insElem.querySelector('iframe');
      if (currentStatus === 'filled' || (hasIframe && currentStatus !== 'unfilled')) {
        setAdStatus('filled');
      } else {
        setAdStatus('unfilled');
      }
    }, 2000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [client, slotId]);

  // Completely disappear when no ad is served by Google
  if (adStatus === 'unfilled') {
    return null;
  }

  return (
    <div
      className={`relative w-full transition-all duration-300 ${
        adStatus === 'filled' ? 'my-3 opacity-100' : 'h-0 my-0 opacity-0 overflow-hidden pointer-events-none'
      } ${className}`}
      style={style}
    >
      <div className="w-full flex justify-center items-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
};

