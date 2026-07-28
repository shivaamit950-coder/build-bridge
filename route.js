import { NextResponse } from "next/server";
import { PROVIDERS } from "@/aiProviders";

export async function GET() {
  return NextResponse.json({ providers: PROVIDERS });
}
