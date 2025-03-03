import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="p-4 flex flex-col order-first md:order-last md:justify-between overflow-y-scroll h-[53%] rounded-b-md bg-white w-full md:h-full md:w-1/4 md:rounded-md">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
