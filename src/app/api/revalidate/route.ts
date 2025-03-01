import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");

  if (!tag) {
    return NextResponse.json(
      { message: "Missing tag parameter" },
      { status: 400 }
    );
  }

  try {
    revalidateTag(tag);
    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tag,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error },
      { status: 500 }
    );
  }
}
