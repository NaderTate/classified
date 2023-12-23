import { NextResponse, NextRequest } from "next/server";
export async function POST(request: NextRequest) {
  const body = await request.formData();
  const response = await fetch(process.env.CLOUDINARY_URL as string, {
    method: "POST",
    body,
  });
  const data = await response.json();
  return NextResponse.json({
    id: data.original_filename,
    Image: data.secure_url,
  });
}
