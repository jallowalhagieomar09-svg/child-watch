import { createFileRoute, Link } from "@tanstack/react-router";
import { WifiOff, FileText, Search, BookOpen, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Offline — Child Voice GM" },
      {
        name: "description",
        content:
          "You are offline. Child Voice GM still lets you create reports and read child rights resources — submissions sync automatically when you reconnect.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OfflinePage,
});

function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">You are offline</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Don't worry — Child Voice GM is designed to work without an internet
            connection. You can still report issues and review pages you have visited
            before.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" /> Create a report
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fill in the form normally. Photos, video, voice notes and text are saved
              securely on your device and sent automatically when you reconnect.
            </p>
            <Button asChild size="sm" className="mt-3 w-full">
              <Link to="/report">Start a report</Link>
            </Button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Search className="h-4 w-4 text-primary" /> Track a report
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              If you've already submitted a report, you can look up its tracking code
              once you reconnect.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full">
              <Link to="/track">Open tracker</Link>
            </Button>
          </Card>

          <Card className="p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BookOpen className="h-4 w-4 text-primary" /> Child rights resources
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Pages you have previously visited — the home page, statistics, and legal
              protections — remain readable offline.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full">
              <Link to="/">Go to home page</Link>
            </Button>
          </Card>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Features that always need internet: staff sign-in, voice-note transcription
            and statistics that haven't been loaded before.
          </p>
        </div>
      </main>
    </div>
  );
}
