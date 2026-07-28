import { NextResponse } from "next/server";
import { createClient } from "@/supabaseClient";

export async function GET() {
  return NextResponse.json({ providers: PROVIDERS });
}
