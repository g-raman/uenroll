export const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <div className="mt-auto hidden text-center text-sm md:block">
      <p className="inline-block">Mantained by</p>
      &nbsp;
      <a
        className="border-b border-gray-300 text-gray-700 transition-colors hover:border-black hover:text-black"
        href="https://www.linkedin.com/in/gupta-raman/"
        target="_blank"
      >
        Raman Gupta
      </a>
      ,&nbsp;
      <a
        className="border-b border-gray-300 text-gray-700 transition-colors hover:border-black hover:text-black"
        href="https://github.com/g-raman/uenroll"
        target="_blank"
      >
        GitHub
      </a>
      &nbsp;&copy;{year}.
    </div>
  )
}
