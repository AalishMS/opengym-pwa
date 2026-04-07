"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function A2HSPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  if (!deferredPrompt || hidden) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-full max-w-md px-4">
      <div className="rounded-2xl border border-border bg-card p-3 shadow-lg">
        <p className="text-sm font-medium">Install OpenGym for quick access</p>
        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={async () => {
              await deferredPrompt.prompt();
              const choice = await deferredPrompt.userChoice;
              if (choice.outcome === "accepted") {
                setHidden(true);
              }
            }}
          >
            Add to Home Screen
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setHidden(true)}
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
