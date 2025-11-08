import { Footer } from "../Footer/Footer";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background full flex h-[calc(100%-0.5rem)] w-full flex-col overflow-x-scroll rounded-b-md px-4 pb-4 md:order-last md:h-full md:w-[calc(100%-1rem)] md:rounded-md">
      {children}
      <Footer />
    </div>
  );
}
