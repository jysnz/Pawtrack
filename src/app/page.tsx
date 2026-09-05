"use client";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const FoundPetMap = dynamic(() => import("@/components/FoundPetMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-sm text-black/50">
      Loading map…
    </div>
  ),
});

type LatLng = { lat: number; lng: number };
type Status = "idle" | "sending" | "sent" | "error";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <FoundPetPage />
    </Suspense>
  );
}

function FoundPetPage() {
  // The owner's contact info is never typed in by the finder — in the real
  // product it's baked into the NFC card as a URL param, e.g.
  // pawtrack.app/?owner=<id>, and tapping the card is what carries it here.
  // For this prototype we fall back to a placeholder when that param is
  // missing, so the flow can be tried without an actual NFC card.
  const searchParams = useSearchParams();
  const ownerContact = searchParams.get("owner") ?? "prototype-owner";

  const [location, setLocation] = useState<LatLng | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = location !== null;

  async function handleNotify() {
    if (!canSubmit) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerContact,
          message,
          location,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          🐾 Found this pet?
        </h1>
        <p className="text-sm text-black/60">
          Drop a pin at the spot where you found the pet, add a quick note if
          you&apos;d like, and notify the owner. We already know who to
          notify from the card you tapped.
        </p>
      </header>

      <section className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-h-[360px] lg:min-h-0">
          <FoundPetMap onLocationChange={setLocation} />
          <p className="mt-2 text-xs text-black/50">
            Tap anywhere on the map to mark exactly where the pet was found.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNotify();
          }}
          className="flex flex-col gap-4 rounded-2xl border border-black/10 p-5 shadow-sm"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message (optional)
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your pet is safe with me near the park entrance."
              className="resize-none rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
            />
          </div>

          <div className="text-xs text-black/50">
            {location
              ? `Pinned location: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : "No location pinned yet — tap the map to set one."}
          </div>

          <button
            type="submit"
            disabled={!canSubmit || status === "sending"}
            className="mt-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "sending" ? "Notifying…" : "Notify Owner"}
          </button>

          {status === "sent" && (
            <p className="text-sm text-green-600">
              ✅ The owner has been notified.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">⚠️ {errorMsg}</p>
          )}
        </form>
      </section>
    </main>
  );
}
