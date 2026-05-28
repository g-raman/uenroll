import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { cn } from "@repo/ui/lib/utils";
import { useTranslation } from "react-i18next";
import { GitHubContributors } from "@/components/GitHubContributors";

type AboutButtonProps = {
  className?: string;
};

export function AboutButton({ className }: AboutButtonProps) {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("h-10 px-4 font-medium", className)}
          >
            {t("about.button")}
          </Button>
        }
      />

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("about.title")}</DialogTitle>
          <DialogDescription>{t("about.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t("about.body")}</p>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div>
              <p className="font-medium text-foreground">
                {t("about.contributors")}
              </p>

              <GitHubContributors />
            </div>

            <div className="mt-4 border-t pt-3">
              <p className="font-medium text-foreground">
                {t("about.project")}
              </p>

              <div className="mt-2">
                <a
                  href="https://github.com/g-raman/uenroll"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {t("about.github")}
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("about.copyright", { year })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
