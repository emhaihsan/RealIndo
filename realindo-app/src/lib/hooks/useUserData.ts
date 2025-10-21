import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserData {
  id: string;
  wallet_address: string;
  email: string | null;
  name: string | null;
  current_exp: number;
  total_exp_earned: number;
  created_at: string;
  updated_at: string;
}

export function useUserData(walletAddress: string | undefined) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("wallet_address", walletAddress.toLowerCase())
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [walletAddress]);

  return { userData, loading, error, refetch: () => {} };
}
