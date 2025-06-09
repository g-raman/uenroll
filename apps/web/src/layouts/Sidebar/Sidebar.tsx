import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="order-first flex h-[53%] w-full flex-col overflow-y-scroll rounded-b-md md:order-last md:h-full md:w-2/5 md:rounded-md xl:w-1/4">
      <Header />
      <div className="bg-background flex h-full flex-col p-4 md:rounded-md">
        {children}
        <Footer />
      </div>
    </div>
  );
}
