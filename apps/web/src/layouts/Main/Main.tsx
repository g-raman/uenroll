export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full rounded-t-md border-none bg-white p-2 md:h-full md:rounded-md dark:bg-[#141218]">
      {children}
    </div>
  );
}
