"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type State = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

export function PushNotificationButton() {
  const [state, setState] = useState<State>("loading");
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function init() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      setReg(registration);
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? "subscribed" : "unsubscribed");
    }
    void init();
  }, []);

  async function subscribe() {
    if (!reg) return;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState("denied");
      return;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub }),
    });
    setState("subscribed");
  }

  async function unsubscribe() {
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) {
      setState("unsubscribed");
      return;
    }
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
    await sub.unsubscribe();
    setState("unsubscribed");
  }

  // Try re-requesting permission — works on some mobile browsers that allow re-asking.
  // If still denied, show the manual instructions panel.
  async function retryPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted" && reg) {
      await subscribe();
    } else {
      setShowHelp(true);
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={retryPermission}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Enable Notifications
        </button>
        {showHelp && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <p className="mb-1.5 font-semibold">Notifications are blocked. To enable:</p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>
                Tap the <strong>lock icon</strong> or <strong>info icon</strong> in your
                browser&apos;s address bar
              </li>
              <li>
                Tap <strong>Site settings</strong> (or <strong>Permissions</strong>)
              </li>
              <li>
                Find <strong>Notifications</strong> and set it to <strong>Allow</strong>
              </li>
              <li>Reload this page</li>
            </ol>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={state === "subscribed" ? unsubscribe : subscribe}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        state === "subscribed"
          ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
          : "border-border bg-background text-foreground hover:bg-background-subtle"
      }`}
    >
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {state === "subscribed" ? "Notifications On" : "Enable Notifications"}
    </button>
  );
}
