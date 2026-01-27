import { useState, useRef, useCallback } from "react";

const SWIPE_COMMIT_THRESHOLD = 0.3;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const ANIMATION_DURATION = 200;

interface TouchStartData {
  x: number;
  y: number;
  time: number;
  lastX: number;
  lastTime: number;
  isHorizontal: boolean | null;
}

export const useSwipeNavigation = (
  onNavigate: (direction: "next" | "previous") => void,
  enabled: boolean,
) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerWidthRef = useRef(0);
  const touchStartRef = useRef<TouchStartData | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (isAnimating) return;
      const touch = e.touches[0];
      if (!touch) return;

      const container = e.currentTarget;
      containerWidthRef.current = container.getBoundingClientRect().width - 64;

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        lastX: touch.clientX,
        lastTime: Date.now(),
        isHorizontal: null,
      };
    },
    [isAnimating],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || isAnimating) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (touchStartRef.current.isHorizontal === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX > 10 || absY > 10) {
          touchStartRef.current.isHorizontal = absX > absY;
        }
      }

      if (touchStartRef.current.isHorizontal) {
        setIsDragging(true);
        setDragOffset(deltaX);

        touchStartRef.current.lastX = touch.clientX;
        touchStartRef.current.lastTime = Date.now();
      }
    },
    [isAnimating],
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || !isDragging) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      if (!touch) return;

      const containerWidth = containerWidthRef.current || 300;
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = Date.now() - touchStartRef.current.lastTime;
      const velocityX =
        (touch.clientX - touchStartRef.current.lastX) / Math.max(deltaTime, 1);

      const dragPercentage = Math.abs(deltaX) / containerWidth;

      const shouldCommit =
        dragPercentage > SWIPE_COMMIT_THRESHOLD ||
        Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldCommit) {
        setIsAnimating(true);
        const direction = deltaX > 0 ? "previous" : "next";
        const targetOffset =
          direction === "next" ? -containerWidth : containerWidth;

        setDragOffset(targetOffset);

        setTimeout(() => {
          onNavigate(direction);
          setDragOffset(0);
          setIsDragging(false);
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      } else {
        setIsAnimating(true);
        setDragOffset(0);

        setTimeout(() => {
          setIsDragging(false);
          setIsAnimating(false);
        }, ANIMATION_DURATION);
      }

      touchStartRef.current = null;
    },
    [isDragging, onNavigate],
  );

  return {
    dragOffset,
    isDragging,
    isAnimating,
    containerWidthRef,
    handlers: enabled
      ? {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        }
      : {},
  };
};
