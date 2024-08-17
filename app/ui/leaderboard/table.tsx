"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { toRoman } from "@/app/lib/utils";

export default function Table({ user }: { user: User | null }) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<any>([]);
  const [selectedCircles, setSelectedCircles] = useState(6);
  const [loading, setLoading] = useState(false);

  const changeSelectOptionHandler = (event: any) => {
    setSelectedCircles(Number(event.target.value));
  };

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: profilesData,
        error,
        status,
      } = await supabase.from("profiles").select(`id, username, avatar_url`);

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (profilesData) {
        const profilesWithScores = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: scoreData } = await supabase
              .from("scores")
              .select(`apm, time`)
              .eq("user_id", profile.id)
              .eq("targets", selectedCircles)
              .order("apm", { ascending: false })
              .limit(1);

            let avatarUrl = null;

            if (profile.avatar_url) {
              const { data, error } = await supabase.storage
                .from("avatars")
                .download(profile.avatar_url);

              if (!error) {
                avatarUrl = URL.createObjectURL(data);
              }
            }

            const { count: playCount, error: playCountError } = await supabase
              .from("scores")
              .select("*", { count: "exact" })
              .eq("user_id", profile.id);

            if (playCountError) {
              console.error(
                "error fetching user scores count:",
                playCountError,
              );
            }

            let romanLevel = toRoman((playCount as number) / 100);

            return {
              ...profile,
              apm: scoreData?.length ? scoreData[0].apm : 0, // Defina um valor padrão se não houver score
              time: scoreData?.length ? scoreData[0].time : 0, // Defina um valor padrão se não houver score
              avatarUrl,
              romanLevel: romanLevel || "-",
            };
          }),
        );
        profilesWithScores.sort((a, b) => b.apm - a.apm);

        setProfiles(profilesWithScores);
      }
    } catch (error) {
      console.log(error);
      alert(error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase, selectedCircles]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile, selectedCircles]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-full px-4 justify-between text-sm">
        <div className="flex max-w-full items-start">
          <label htmlFor="targets">
            leaderboard <span className="opacity-50">targets:</span>{" "}
          </label>
          <select
            className="bg-black text-white rounded-none outline-none hover:opacity-70"
            name="targets"
            id="targets"
            defaultValue={"6"}
            onChange={changeSelectOptionHandler}
          >
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <option value={10 - i} key={10 - i}>
                  {10 - i}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-full px-4 py-2 flex-1">
          {loading ? (
            <p className="opacity-50">loading...</p>
          ) : (
            <div>
              <div className="flex justify-between opacity-50">
                <div className="w-[15px] mr-2"></div>
                <p className="w-full flex-1">username</p>
                <p className="w-full flex-1 text-right">HS[6] APM</p>
                <p className="w-full flex-1 text-right">TIME</p>
                <p className="w-full flex-1 text-right">LEVEL</p>
              </div>
              {profiles.map((profile: any) => (
                <Link
                  key={profile.id}
                  href={`/${profile.id}`}
                  className="flex justify-between items-center hover:bg-neutral-950"
                >
                  <div className="relative w-[17.5px] h-[17.5px] mr-2">
                    <Image
                      src={profile.avatarUrl || "/perfect-blue.jpg"}
                      alt="user avatar"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <p className="w-full flex-1 overflow-hidden">
                    {profile.username}
                  </p>
                  <p className="w-full flex-1 text-right">{profile.apm}</p>
                  <p className="w-full flex-1 text-right">
                    {profile.time / 1000}
                  </p>
                  <p className="w-full flex-1 text-right">
                    {profile.romanLevel}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 py-2 flex-1 text-right">
          <p className="opacity-50">
            every 100 times you play, you will level up
            <br />
            levels are represented by roman characters
          </p>
        </div>
      </div>
    </div>
  );
}
