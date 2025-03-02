export const Footer = (props: {}) => {
  const year = new Date().getFullYear();
  return (
    <div className="mt-auto p-4 text-center text-sm">
      <p className="inline-block">Mantained by</p>
      &nbsp;
      <a
        className="text-gray-700 hover:text-black transition-colors border-b border-gray-300 hover:border-black"
        href="https://www.linkedin.com/in/gupta-raman/"
        target="_blank"
      >
        Raman Gupta
      </a>
      ,&nbsp;
      <a
        className="text-gray-700 hover:text-black transition-colors border-b border-gray-300 hover:border-black"
        href="https://github.com/g-raman/uenroll"
        target="_blank"
      >
        GitHub
      </a>
      &nbsp;&copy;{year}.
    </div>
  );
};
