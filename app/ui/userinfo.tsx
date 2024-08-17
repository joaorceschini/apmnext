"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { toRoman } from "@/app/lib/utils";

export default function UserInfo({ user }: { user: User | null }) {
  const supabase = createClient();
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [romanLevel, setRomanLevel] = useState("");

  const [downloadedAvatar, setDownloadedAvatar] = useState<string | null>(
    avatarUrl,
  );

  const getProfile = useCallback(async () => {
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("error loading user data");
    }
  }, [user, supabase]);

  const getUserScoresCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("scores")
        .select("*", { count: "exact" })
        .eq("user_id", user?.id);

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
    getProfile();
    getUserScoresCount();
  }, [user, getProfile, getUserScoresCount]);

  useEffect(() => {
    const romanLevel = toRoman(playCount / 100);
    setRomanLevel(romanLevel);
  }, [playCount]);

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        setDownloadedAvatar(url);
      } catch (error) {
        console.log("error downloading image: ", error);
      }
    }

    if (avatarUrl) downloadImage(avatarUrl);
  }, [avatarUrl, supabase]);

  return (
    <div className="flex gap-2 items-end">
      <div className="h-full flex flex-col justify-end">
        <p className="opacity-70 text-end">{romanLevel || "-"}</p>
        <p>{username || "..."}</p>
      </div>
      <Link
        href={`/${user?.id}`}
        className="relative hover:opacity-70 w-[50px] h-[50px]"
      >
        <Image
          src={downloadedAvatar || "/perfect-blue.jpg"}
          alt="user avatar"
          layout={"fill"}
          fill
          style={{ objectFit: "cover" }}
        />
      </Link>
    </div>
  );
}
