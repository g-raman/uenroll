import { Button } from "@repo/ui/components/button";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className="mt-auto hidden text-center text-sm md:block">
      <p className="inline-block">Mantained by</p>
      &nbsp;
      <Button className="p-0 underline dark:text-white" variant="link" asChild>
        <a
          href="https://www.linkedin.com/in/gupta-raman/"
          target="_blank"
          rel="noreferrer"
        >
          Raman Gupta
        </a>
      </Button>
      ,&nbsp;
      <Button className="p-0 underline dark:text-white" variant="link" asChild>
        <a
          href="https://github.com/g-raman/uenroll"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </Button>
      &nbsp;&copy;{year}.
    </div>
  );
};
