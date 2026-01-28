import { getTransformStyle } from "./animation";

interface SlidingContainerProps {
  offset: number;
  isAnimating: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SlidingContainer({
  offset,
  isAnimating,
  children,
  className = "",
  style = {},
}: SlidingContainerProps) {
  return (
    <div
      className={className}
      style={{
        ...style,
        ...getTransformStyle(offset, isAnimating),
      }}
    >
      {children}
    </div>
  );
}
