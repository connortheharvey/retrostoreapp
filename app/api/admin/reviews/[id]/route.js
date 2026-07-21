import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(request) {
  const password = request.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
}

// Restore a review that was wrongly flagged
export async function PATCH(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const { id } = params;
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("reviews")
    .update({ flagged: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Permanently delete a review
export async function DELETE(request, { params }) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const { id } = params;
  const supabase = getAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
