export default function Main({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-full w-full overflow-hidden rounded-t-md border-none bg-white max-md:h-auto max-md:min-h-full max-md:overflow-visible md:rounded-md dark:bg-[#141218]">
      {children}
    </div>
  );
}
