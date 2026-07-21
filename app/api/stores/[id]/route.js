import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";

export async function GET(_request, { params }) {
  const { id } = params;
  const supabase = getPublicClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*, reviews(id, reviewer_name, rating, comment, flagged, created_at), photos(id, url, created_at)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: "Store not found." }, { status: 404 });
  }

  data.reviews = (data.reviews || []).filter((r) => !r.flagged);
  return NextResponse.json(data);
}
