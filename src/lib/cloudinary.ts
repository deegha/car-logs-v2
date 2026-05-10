const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "carlistings";
const FOLDER = "car-listing";

export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadCarImage(file: File | Blob): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME environment variable is not set");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", FOLDER);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: { message?: string } }).error?.message ??
        `Cloudinary upload failed (HTTP ${res.status})`
    );
  }

  const data = await res.json();

  return {
    publicId: data.public_id as string,
    secureUrl: data.secure_url as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
  };
}
