import { Footer } from "../Footer/Footer";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex h-[calc(100%-0.5rem)] flex-col rounded-b-md px-4 pb-4 md:rounded-md lg:order-last lg:h-full lg:max-w-[30%]">
      {children}
      <Footer />
    </div>
  );
}
