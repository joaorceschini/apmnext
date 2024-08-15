"use client";

import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Avatar from "./avatar";
import { useCallback, useEffect, useState } from "react";
import { signOut } from "@/app/login/actions";

export default function ProfileForm({
  user,
  userId,
}: {
  user: User | null;
  userId: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url`)
        .eq("id", userId)
        .single();

      if (status == 406) {
        setNotFound("this profile doesn't exists");
      }

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
      setMessage("error loading user data");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    fullname,
    username,
    website,
    avatar_url,
  }: {
    fullname: string | null;
    username: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      if (user?.id !== userId) {
        throw new Error("Unauthorized");
      }

      setLoading(true);

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullname,
        username,
        website,
        avatar_url,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      setMessage("profile updated");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Unauthorized") {
          setMessage("you are not authorized to update this profile");
        } else {
          setMessage(`error updating the data: ${error.message}`);
        }
      } else {
        setMessage("an unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  function removeAvatar() {
    setAvatarUrl(null);
    updateProfile({
      fullname,
      username,
      website,
      avatar_url: null,
    });
  }

  const canEdit = user && user.id === userId;

  return (
    <>
      {notFound ? (
        <div className="px-4 py-2">
          <p>{notFound}</p>
        </div>
      ) : (
        <div className="w-full px-4 py-2 flex flex-col gap-4">
          <div className="w-full flex gap-4 relative">
            {avatar_url && canEdit && (
              <button
                className="absolute z-10 left-1 text-xl text-red-500 outline-none"
                onClick={removeAvatar}
              >
                x
              </button>
            )}
            <Avatar
              uid={userId ?? null}
              url={avatar_url}
              onUpload={(url) => {
                if (canEdit) {
                  setAvatarUrl(url);
                  updateProfile({
                    fullname,
                    username,
                    website,
                    avatar_url: url,
                  });
                }
              }}
            />
            <div className="flex flex-col justify-between">
              {canEdit && (
                <div>
                  <label htmlFor="email" className="sr-only">
                    email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email}
                    className="opacity-70 bg-transparent"
                    disabled
                  />
                </div>
              )}
              <div>
                <div>
                  <label htmlFor="username" className="sr-only">
                    username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username || ""}
                    placeholder="username"
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent outline-none"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullname || ""}
                    placeholder="full name"
                    onChange={(e) => setFullname(e.target.value)}
                    className="bg-transparent outline-none"
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label htmlFor="website" className="sr-only">
                    website
                  </label>
                  <input
                    id="website"
                    type="url"
                    value={website || ""}
                    placeholder="website"
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-transparent outline-none"
                    disabled={!canEdit}
                  />
                </div>
              </div>
              {canEdit && (
                <div className="flex justify-between items-end">
                  <div>
                    <button
                      className="button primary block"
                      onClick={() =>
                        updateProfile({
                          fullname,
                          username,
                          website,
                          avatar_url,
                        })
                      }
                      disabled={loading}
                    >
                      {loading ? "loading ..." : "update"}
                    </button>
                  </div>

                  <div>
                    <form action={signOut} method="post">
                      <button className="button block" type="submit">
                        sign out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="opacity-70">
            <p>{message}</p>
          </div>
        </div>
      )}
    </>
  );
}
