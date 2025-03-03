export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="p-2 h-[50%] rounded-t-md bg-white md:h-full md:w-3/4 md:rounded-md">
      {children}
    </div>
  );
}
