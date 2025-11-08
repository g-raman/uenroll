export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full border-none rounded-t-md bg-white p-2 md:h-full md:rounded-md dark:bg-[#141218]">
      {children}
    </div>
  );
}
