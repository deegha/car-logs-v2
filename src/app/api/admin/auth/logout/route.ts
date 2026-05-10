import { clearAdminSession } from "@/lib/auth";

export async function DELETE() {
  await clearAdminSession();
  return Response.json({ success: true });
}
