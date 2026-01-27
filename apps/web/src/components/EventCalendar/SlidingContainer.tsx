import { getTransformStyle } from "./utils";

export const SlidingContainer = ({
  offset,
  isAnimating,
  children,
  className = "",
  style = {},
}: {
  offset: number;
  isAnimating: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
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
