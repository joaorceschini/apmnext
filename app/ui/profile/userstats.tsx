"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toRoman } from "@/app/lib/utils";

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
  const [playCount, setPlayCount] = useState(0);
  const [romanLevel, setRomanLevel] = useState("");

  const getHighestApm = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("apm, time")
        .eq("user_id", userId)
        .eq("targets", 6)
        .order("apm", { ascending: false })
        .limit(1);

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

      setPlayCount(count || 0);
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

  useEffect(() => {
    const romanLevel = toRoman(playCount / 100);
    setRomanLevel(romanLevel);
  }, [playCount]);

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
          <div className="flex flex-col flex-1">
            <div className="flex justify-between">
              <p>LEVEL</p>
              <p>{romanLevel || "-"}</p>
            </div>
            <div className="flex justify-between opacity-50">
              <p>play count</p>
              <p>[{playCount}]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
