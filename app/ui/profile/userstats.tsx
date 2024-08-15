"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

export default function UserStats({
  user,
  userId,
}: {
  user: User | null;
  userId: string;
}) {
  const supabase = createClient();
  const [hs, setHs] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const getHighestApm = useCallback(async () => {
    try {
      const { data, error, status } = await supabase
        .from("scores")
        .select("apm, time")
        .eq("user_id", userId)
        .eq("targets", 6)
        .order("apm", { ascending: false })
        .limit(1);

      if (status == 406) {
        setNotFound("this profile doesn't exists");
      }

      if (error) throw error;

      const highestApm = data[0]?.apm || 0;
      const bestTime = data[0]?.time || 0;
      setHs(highestApm);
      setBestTime(bestTime);
      return highestApm;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }, [user, supabase]);

  const getUserScoresCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("scores")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      if (error) throw error;

      setPlayCount(count);
      return count;
    } catch (error) {
      if (error instanceof Error) {
        console.error("error fetching user scores count:", error.message);
      } else {
        console.error(
          "an unknown error occurred while fetching user scores count",
        );
      }
      return 0;
    }
  }, [user]);

  useEffect(() => {
    getHighestApm();
    getUserScoresCount();
  }, [user, getHighestApm, getUserScoresCount]);

  return (
    <div className="w-full px-4 py-2 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex gap-4 justify-between">
          <div className="flex flex-1 gap-2 font-bold">
            <p>HS[6]</p>
            <div className="flex flex-col flex-1">
              <div className="flex justify-between">
                <p>APM</p>
                <p>{hs || "..."}</p>
              </div>
              <div className="flex justify-between">
                <p>TIME</p>
                <p>{(bestTime as number) / 1000 || "..."}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 justify-end">
            <p className="opacity-70">play count [{playCount}]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
