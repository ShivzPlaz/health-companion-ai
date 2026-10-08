import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "../i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NexCure AI — Healthcare Assistant" },
      {
        name: "description",
        content:
          "AI-powered preliminary health guidance, symptom analysis, and consultation support — anytime, anywhere.",
      },
      { name: "author", content: "NexCure" },
      { property: "og:title", content: "NexCure AI — Healthcare Assistant" },
      {
        property: "og:description",
        content: "Get preliminary health guidance anytime with our AI healthcare assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@NexCureAI" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://api.fontshare.com",
      },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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

const BG_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_065045_c44942da-53c6-4804-b734-f9e07fc22e08.mp4";

function useVideoFade(videoRef: React.RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE_DURATION = 0.5;
    let rafId: number;
    let isDestroyed = false;

    function fadeLoop() {
      if (isDestroyed || !video) return;
      const { currentTime, duration } = video;
      if (!duration || isNaN(duration)) {
        rafId = requestAnimationFrame(fadeLoop);
        return;
      }
      const timeLeft = duration - currentTime;

      if (currentTime < FADE_DURATION) {
        video.style.opacity = String(Math.min(currentTime / FADE_DURATION, 1));
      } else if (timeLeft < FADE_DURATION) {
        video.style.opacity = String(Math.max(timeLeft / FADE_DURATION, 0));
      } else {
        video.style.opacity = "1";
      }
      rafId = requestAnimationFrame(fadeLoop);
    }

    function handleEnded() {
      if (isDestroyed || !video) return;
      video.style.opacity = "0";
      setTimeout(() => {
        if (isDestroyed || !video) return;
        video.currentTime = 0;
        video.play().catch(() => {});
        rafId = requestAnimationFrame(fadeLoop);
      }, 100);
    }

    video.addEventListener("ended", handleEnded);
    video.play().catch(() => {});
    rafId = requestAnimationFrame(fadeLoop);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", handleEnded);
      video.pause();
    };
  }, [videoRef]);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  useVideoFade(videoRef);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <div className="video-bg-wrapper min-h-screen flex flex-col overflow-hidden text-white font-geist">
          {/* Looping background video */}
          <video
            ref={videoRef}
            className="bg-video"
            src={BG_VIDEO_URL}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          {/* Blurred overlay shape */}
          <div className="hero-blur-shape" aria-hidden="true" />

          {/* Content layer above video */}
          <div className="video-bg-content flex flex-col min-h-screen">
            <Outlet />
            <Toaster richColors position="top-right" />
          </div>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
