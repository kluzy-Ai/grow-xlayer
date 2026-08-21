import { redirect } from "next/navigation";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ campaignId: string }> | { campaignId: string };
}) {
  const resolved = await params;
  const campaignId = resolved?.campaignId;
  const startQuery = campaignId ? `?start=${campaignId}` : "";
  redirect(`https://t.me/GrowXlayerbot${startQuery}`);
}
