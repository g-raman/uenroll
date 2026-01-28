import { ReactNode } from "react";

export default function App({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex h-dvh w-dvw flex-col justify-between bg-black text-xs md:p-4 lg:flex-row-reverse lg:gap-4">
      {children}
    </div>
  );
}
