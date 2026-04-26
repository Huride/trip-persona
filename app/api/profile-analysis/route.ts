import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeInstagramProfile } from "@/src/lib/profilePipeline";

const requestSchema = z.object({
  instagramUrl: z.string().min(1)
});

export async function POST(request: Request) {
  const { instagramUrl } = requestSchema.parse(await request.json());
  const result = await analyzeInstagramProfile(instagramUrl);

  return NextResponse.json(result);
}
