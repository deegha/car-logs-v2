export function cloudinaryUrl(url: string, transforms: string): string {
  if (!url || !transforms || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/image/upload/f_auto,q_auto/", `/image/upload/f_auto,q_auto,${transforms}/`);
}

// Produces a 1200×630 JPEG URL suitable for og:image / twitter:image.
// Works regardless of whether the stored URL already has a transform block.
export function cloudinaryOgUrl(url: string): string {
  if (!url?.includes("res.cloudinary.com")) return url;
  const t = "c_fill,g_auto,w_1200,h_630,f_jpg,q_80";
  // Replace an existing transform block (e.g. "f_auto,q_auto") if present
  const replaced = url.replace(/\/image\/upload\/(?!v\d)([^/]+)\//, `/image/upload/${t}/`);
  if (replaced !== url) return replaced;
  // No transform block — insert right after /upload/
  return url.replace("/image/upload/", `/image/upload/${t}/`);
}
