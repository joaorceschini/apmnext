import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserInfo from "@/app/ui/userinfo";
import Game from "@/app/ui/game";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <main>
      <div className="w-full max-w-[80rem] min-h-screen mx-auto flex gap-4 pb-4 flex-col">
        <div className="flex gap-4 max-w-full px-4 py-2 border-b border-dashed border-neutral-800 overflow-hidden items-center flex-row justify-between">
          <h1 className="font-bold uppercase">apm test</h1>
          <Link
            href="https://github.com/joaorceschini"
            target="_blank"
            className="hover:underline opacity-50 text-xs"
          >
            by jces
          </Link>
        </div>
        <Game user={user} />
      </div>
    </main>
  );
}
