interface CurrentTimeIndicatorProps {
  position: number; // percentage (0-100)
  paddingHeight: number;
  contentHeight: number;
}

export function CurrentTimeIndicator({
  position,
  paddingHeight,
  contentHeight,
}: CurrentTimeIndicatorProps) {
  return (
    <div
      className="pointer-events-none absolute right-0 left-0 flex items-center"
      style={{
        top: paddingHeight + (position / 100) * contentHeight,
      }}
    >
      <div className="h-2 w-2 rounded-full bg-red-500" />
      <div className="h-[2px] flex-1 bg-red-500" />
    </div>
  );
}
