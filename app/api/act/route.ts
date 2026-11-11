import { NextResponse } from "next/server";
import { applyAction } from "@/lib/db";
import type { Action } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const action = (await request.json()) as Action;
  try {
    return NextResponse.json(applyAction(action));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não deu.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
