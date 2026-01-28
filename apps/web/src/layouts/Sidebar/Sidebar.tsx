import { Footer } from "../Footer/Footer";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex flex-col border px-4 pb-4 md:h-[calc(100%-0.5rem)] lg:order-last lg:h-full lg:max-w-[30%] lg:min-w-[30%] lg:rounded-lg">
      {children}
      <Footer />
    </div>
  );
}
