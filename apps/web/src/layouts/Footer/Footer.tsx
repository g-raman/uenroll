import { Button } from "@repo/ui/components/button";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="mt-auto hidden border-t pt-4 text-center text-sm md:block">
      <span className="text-muted-foreground">{t("footer.openSourceOn")} </span>

      <Button
        nativeButton={false}
        className="h-auto p-0 text-foreground underline underline-offset-4 hover:opacity-70"
        variant="link"
        render={
          <a
            href="https://github.com/g-raman/uenroll"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        }
      />

      <span className="text-muted-foreground">
        {" "}
        {t("footer.copyright", { year })}
      </span>
    </footer>
  );
};
