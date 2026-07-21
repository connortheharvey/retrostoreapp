import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getPublicClient();

  const { data, error } = await supabase
    .from("stores")
    .select("*, reviews(id, reviewer_name, rating, comment, flagged, created_at), photos(id, url, created_at)")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cleaned = data.map((s) => ({
    ...s,
    reviews: (s.reviews || []).filter((r) => !r.flagged),
  }));

  return NextResponse.json(cleaned);
}

export async function POST(request) {
  const body = await request.json();
  const { name, address, description, specialties, website } = body;

  if (!name?.trim() || !address?.trim()) {
    return NextResponse.json(
      { error: "Every store needs a name and an address." },
      { status: 400 }
    );
  }

  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("stores")
    .insert({
      name: name.trim(),
      address: address.trim(),
      description: description?.trim() || "No description yet.",
      specialties: Array.isArray(specialties) ? specialties : [],
      website: website?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
