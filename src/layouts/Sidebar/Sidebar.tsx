import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="order-first flex h-[53%] w-full flex-col overflow-y-scroll rounded-b-md bg-white p-4 md:order-last md:h-full md:w-1/4 md:justify-between md:rounded-md">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
