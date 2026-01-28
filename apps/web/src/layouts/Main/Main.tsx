export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full min-h-[48rem] w-full overflow-hidden rounded-t-md border-none bg-white md:h-full md:rounded-md dark:bg-[#141218]">
      {children}
    </div>
  );
}
