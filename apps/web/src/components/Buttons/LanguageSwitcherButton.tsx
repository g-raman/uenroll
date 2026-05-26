import { Button } from "@repo/ui/components/button";
import { useTranslation } from "react-i18next";
import { cn } from "@repo/ui/lib/utils";

type LanguageSwitcherButtonProps = {
  className?: string;
};

export function LanguageSwitcherButton({ className }: LanguageSwitcherButtonProps) {
  const { i18n } = useTranslation();

  const nextLanguage = i18n.language === "fr" ? "en" : "fr";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("w-full justify-center", className)}
      onClick={() => i18n.changeLanguage(nextLanguage)}
    >
      {nextLanguage.toUpperCase()}
    </Button>
  );
}