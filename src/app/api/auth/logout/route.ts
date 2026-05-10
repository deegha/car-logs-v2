import { clearSellerSession } from "@/lib/auth"

export async function DELETE() {
  await clearSellerSession()
  return Response.json({ success: true })
}
