import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { OnlineStatusBanner } from "@/components/OnlineStatusBanner";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ThemeProvider } from "@/hooks/useTheme";
import { registerServiceWorker } from "@/lib/pwa";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Child Voice GM — Report child rights issues" },
      {
        name: "description",
        content:
          "Confidential reporting of child rights issues in The Gambia, in Mandinka, Wolof, Fula, Jola, and English.",
      },
      { property: "og:title", content: "Child Voice GM — Report child rights issues" },
      {
        property: "og:description",
        content: "Report child rights issues safely, in your language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Child Voice GM — Report child rights issues" },
      { name: "description", content: "Child Voice GM enables localized reporting of child rights issues via text, image, video, or voice in local languages." },
      { property: "og:description", content: "Child Voice GM enables localized reporting of child rights issues via text, image, video, or voice in local languages." },
      { name: "twitter:description", content: "Child Voice GM enables localized reporting of child rights issues via text, image, video, or voice in local languages." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e76d5e96-21b9-4ca4-9e35-d5dabd1524c2/id-preview-e2cad866--324347b9-9e7d-49bc-a301-ed9cb52087c7.lovable.app-1776600020355.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e76d5e96-21b9-4ca4-9e35-d5dabd1524c2/id-preview-e2cad866--324347b9-9e7d-49bc-a301-ed9cb52087c7.lovable.app-1776600020355.png" },
      { name: "theme-color", content: "#E63946" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Child Voice GM" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <OnlineStatusBanner />
            <Outlet />
            <InstallPrompt />
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
