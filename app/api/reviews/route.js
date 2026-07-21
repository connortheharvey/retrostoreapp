import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase";

export async function POST(request) {
  const body = await request.json();
  const { store_id, reviewer_name, rating, comment } = body;

  if (!store_id || !rating || !comment?.trim()) {
    return NextResponse.json(
      { error: "Pick a star rating and write a comment." },
      { status: 400 }
    );
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5 stars." },
      { status: 400 }
    );
  }

  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      store_id,
      reviewer_name: reviewer_name?.trim() || "Anonymous Collector",
      rating,
      comment: comment.trim(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
