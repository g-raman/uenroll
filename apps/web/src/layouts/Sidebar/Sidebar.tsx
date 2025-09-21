import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-[53%] w-full flex-col rounded-b-md md:order-last md:h-full md:w-1/3 md:rounded-md lg:w-1/4 xl:w-1/4">
      <Header />
      <div className="bg-background flex h-full flex-col overflow-x-scroll px-4 pb-4 md:rounded-md">
        {children}
        <Footer />
      </div>
    </div>
  );
}
