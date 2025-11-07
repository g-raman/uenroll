import { useState, useEffect } from "react";

type ScreenSize = {
  width: number | null;
  height: number | null;
};

export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>({
    width: null,
    height: null,
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize(); // set initial size on mount
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}
