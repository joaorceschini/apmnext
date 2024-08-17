import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Game from "@/app/ui/game";
import Header from "@/app/ui/header";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <div className="w-full max-w-[80rem] min-h-screen mx-auto flex gap-4 pb-4 flex-col">
        <Header />
        <Game user={user || null} />
      </div>
    </main>
  );
}
