import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";

// The actual image bytes are uploaded directly from the browser to Supabase Storage
// (see lib/supabaseBrowser.js). This endpoint just records the resulting public URL
// against the store, once the upload itself has already succeeded.
export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { url } = body;

  if (!url?.trim()) {
    return NextResponse.json({ error: "Missing photo URL." }, { status: 400 });
  }

  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("photos")
    .insert({ store_id: id, url: url.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
