"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@/app/ui/profile/avatar";

export default function UserInfo({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [downloadedAvatar, setDownloadedAvatar] = useState<string | null>(
    avatarUrl,
  );

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert("error loading user data");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

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
        <p className="opacity-70 text-end">X</p>
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
          objectFit={"cover"}
        />
      </Link>
    </div>
  );
}
