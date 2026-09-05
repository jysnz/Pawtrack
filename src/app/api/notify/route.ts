import { NextRequest, NextResponse } from "next/server";

type NotifyPayload = {
  ownerContact: string;
  message: string;
  location: { lat: number; lng: number } | null;
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<NotifyPayload>;

  if (!body.ownerContact || !body.location) {
    return NextResponse.json(
      { ok: false, error: "Owner contact and location are required." },
      { status: 400 }
    );
  }

  // TODO: wire this up to a real notification channel (email/SMS/push).
  // For now we just log the report so the flow can be demoed end-to-end.
  console.log("[PawTrack] Found-pet notification:", {
    ownerContact: body.ownerContact,
    message: body.message ?? "",
    location: body.location,
    reportedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
