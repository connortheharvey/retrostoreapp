import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function checkAuth(request) {
  const password = request.headers.get("x-admin-password");
  return password && password === process.env.ADMIN_PASSWORD;
}

export async function GET(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, stores(name)")
    .eq("flagged", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
