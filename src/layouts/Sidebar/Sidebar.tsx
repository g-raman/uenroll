import { Footer } from "../Footer/Footer";
import Header from "../Header/Header";

export default function Sidebar({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col justify-between overflow-y-scroll h-[40%] bg-white w-full rounded-t-md md:h-full md:w-1/4 md:rounded-md">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
