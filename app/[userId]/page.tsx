import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/ui/profile/profile-form";
import Header from "@/app/ui/header";

export default async function Profile({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = createClient();
  const userId = params.userId;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <div className="w-full max-w-[80rem] min-h-screen mx-auto flex gap-4 pb-4 flex-col">
        <Header />
        <div className="flex flex-col gap-4">
          <div className="flex max-w-full px-4 justify-between text-sm">
            <div className="flex max-w-full items-start">
              <p>profile</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ProfileForm user={user} userId={userId} />
            <div className="flex justify-between px-4 py-2 text-sm">
              <div className="w-full max-w-[300px]"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
