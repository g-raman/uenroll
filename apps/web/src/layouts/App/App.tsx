import { ReactNode } from "react";

export default function App({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh w-dvw flex-col bg-black text-xs md:h-dvh md:min-h-0 md:p-4 lg:flex-row-reverse lg:gap-4">
      {children}
    </div>
  );
}
