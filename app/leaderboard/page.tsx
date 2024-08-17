import { createClient } from "@/utils/supabase/server";
import Header from "@/app/ui/header";
import Table from "@/app/ui/leaderboard/table";

export default async function Leaderboard({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      <div className="w-full max-w-[80rem] min-h-screen mx-auto flex gap-4 pb-4 flex-col text-sm">
        <Header />

        <Table user={user} />
      </div>
    </main>
  );
}
