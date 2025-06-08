export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-[46%] rounded-t-md bg-white p-2 md:h-full md:w-3/4 md:rounded-md dark:bg-black">
      {children}
    </div>
  );
}
