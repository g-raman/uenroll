import { ANIMATION_DURATION } from "./constants";

/**
 * Get transform style for sliding animations
 */
export function getTransformStyle(offset: number, isAnimating: boolean) {
  return {
    transitionProperty: isAnimating ? "transform" : "none",
    transitionDuration: isAnimating ? `${ANIMATION_DURATION}ms` : "0ms",
    transitionTimingFunction: "ease-out",
    transform: `translateX(${offset}px)`,
  };
}

/**
 * Get desktop animation class based on animation state
 * Classes are lg-prefixed so they only apply on desktop
 */
export function getDesktopAnimationClass(state: string): string {
  switch (state) {
    case "slide-out-left":
      return "animate-slide-out-left";
    case "slide-out-right":
      return "animate-slide-out-right";
    case "slide-in-left":
      return "animate-slide-in-left";
    case "slide-in-right":
      return "animate-slide-in-right";
    default:
      return "";
  }
}
