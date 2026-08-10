import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  initialCount?: number;
  step?: number;
  dependencies?: any[];
}

export function useInfiniteScroll<T>(items: T[], options: UseInfiniteScrollOptions = {}) {
  const { initialCount = 12, step = 12, dependencies = [] } = options;
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when dependencies or items change
  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items.length, ...dependencies]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || visibleCount >= items.length) return;
    setIsLoadingMore(true);
    // Small delay to prevent jitter and show subtle loading feedback
    const timer = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + step, items.length));
      setIsLoadingMore(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [isLoadingMore, visibleCount, items.length, step]);

  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '250px' }
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [observerTargetRef.current, visibleCount, items.length, loadMore]);

  const displayedItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    displayedItems,
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    observerTargetRef,
    totalCount: items.length,
  };
}
