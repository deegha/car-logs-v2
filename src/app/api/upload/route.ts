import { uploadCarImage } from "@/lib/cloudinary";

export const maxDuration = 30;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Allow empty type — iOS/Android browsers often omit MIME type for gallery picks.
  // Cloudinary will reject genuinely non-image files on its end.
  if (file instanceof File && file.type && !file.type.startsWith("image/")) {
    return Response.json({ error: "File must be an image" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  try {
    const result = await uploadCarImage(file);
    return Response.json({ url: result.secureUrl });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
