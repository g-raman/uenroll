import { ReactNode } from 'react'

export default function App({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex h-dvh w-dvw flex-col justify-between bg-black text-xs md:flex-row-reverse md:gap-4 md:p-4">
      {children}
    </div>
  )
}
