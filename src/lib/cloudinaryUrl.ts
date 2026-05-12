export function cloudinaryUrl(url: string, transforms: string): string {
  if (!url || !transforms || !url.includes("res.cloudinary.com")) return url;
  return url.replace(
    "/image/upload/f_auto,q_auto/",
    `/image/upload/f_auto,q_auto,${transforms}/`
  );
}
