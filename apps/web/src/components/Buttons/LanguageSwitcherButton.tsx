import { Button } from "@repo/ui/components/button";
import { useTranslation } from "react-i18next";

export function LanguageSwitcherButton() {
  const { i18n } = useTranslation();

  const nextLanguage = i18n.language === "fr" ? "en" : "fr";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => i18n.changeLanguage(nextLanguage)}
    >
      {nextLanguage.toUpperCase()}
    </Button>
  );
}
