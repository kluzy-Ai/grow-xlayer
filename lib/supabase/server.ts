import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createSupabaseClient(cookieStore);
};
