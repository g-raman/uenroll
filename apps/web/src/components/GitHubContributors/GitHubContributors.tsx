import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Contributor = {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
};

const LINKEDIN_BY_GITHUB_LOGIN: Record<string, string> = {
  "g-raman": "https://www.linkedin.com/in/gupta-raman/",
  yaselmo: "https://www.linkedin.com/in/yasser-elmouatadir/",
};

function getLinkedInUrl(login: string) {
  return LINKEDIN_BY_GITHUB_LOGIN[login];
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.68.5.1.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.96c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.79c0 .27.18.59.69.49A10.08 10.08 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.24h4.52V23H.24V8.24ZM8.08 8.24h4.33v2.02h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.02 5.42 6.94V23h-4.52v-7.22c0-1.72-.03-3.94-2.4-3.94-2.4 0-2.77 1.88-2.77 3.82V23h-4.4V8.24Z" />
    </svg>
  );
}

function ContributorCard({
  contributor,
  role,
}: {
  contributor: Contributor;
  role?: string;
}) {
  const linkedinUrl = getLinkedInUrl(contributor.login);

  return (
    <div
      className="flex items-center gap-4 rounded-xl border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
      title={`${contributor.login} — ${contributor.contributions} contributions`}
    >
      <img
        src={contributor.avatar_url}
        alt={`${contributor.login} avatar`}
        className="size-16 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">
            {contributor.login}
          </p>

          {role && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {role}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs">
          <a
            href={contributor.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            <GitHubIcon className="size-3.5" />
            GitHub
          </a>

          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              <LinkedInIcon className="size-3.5" />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function GitHubContributors() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const loadContributors = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/g-raman/uenroll/contributors?per_page=6",
        );

        if (!response.ok) return;

        const data = (await response.json()) as Contributor[];
        setContributors(data);
      } finally {
        setLoading(false);
      }
    };

    void loadContributors();
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("about.loadingContributors")}
      </p>
    );
  }

  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {contributors.map(contributor => (
        <ContributorCard
          key={contributor.id}
          contributor={contributor}
          role={
            contributor.login === "g-raman" ? t("about.founder") : undefined
          }
        />
      ))}
    </div>
  );
}
