import { Button } from "@repo/ui/components/button";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const year = new Date().getFullYear();
  const { t } = useTranslation();
  return (
    <div className="mt-auto hidden text-center text-sm md:block">
      <p className="inline-block">{t("footer.maintainedBy")}</p>
      &nbsp;
      <Button
        nativeButton={false}
        className="p-0 text-foreground underline hover:opacity-70"
        variant="link"
        render={
          <a
            href="https://www.linkedin.com/in/gupta-raman/"
            target="_blank"
            rel="noreferrer"
          >
            Raman Gupta
          </a>
        }
      />
      ,&nbsp;
      <Button
        nativeButton={false}
        className="p-0 text-foreground underline hover:opacity-70"
        variant="link"
        render={
          <a
            href="https://github.com/g-raman/uenroll"
            target="_blank"
            rel="noreferrer"
          >
            {" "}
            GitHub{" "}
          </a>
        }
      />
      &nbsp;&copy;{year}.
    </div>
  );
};
