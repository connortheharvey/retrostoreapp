import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";

// Anyone can report a review. Reported reviews are hidden immediately
// until the site owner checks /admin.
export async function POST(_request, { params }) {
  const { id } = params;
  const supabase = getPublicClient();

  const { error } = await supabase
    .from("reviews")
    .update({ flagged: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
