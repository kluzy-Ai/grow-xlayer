import { redirect } from "next/navigation";

export default function ClaimPage({
  params,
}: {
  params: { campaignId: string };
}) {
  // Redirect to Telegram Bot for automated wallet submission or proof page
  redirect(`https://t.me/GrowBot?start=${params.campaignId || "cmp_xlayer1"}`);
}
