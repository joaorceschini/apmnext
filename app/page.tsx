import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import UserInfo from "@/app/ui/userinfo";

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
        <div className="flex max-w-full px-4 justify-between text-sm">
          <div className="flex gap-4 max-w-full items-start">
            <button className="hover:opacity-70">crescent</button>
            <select
              className="bg-black text-white rounded-none outline-none hover:opacity-70"
              name="targets"
              id="targets"
              defaultValue={"6"}
            >
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <option value={10 - i}>{10 - i}</option>
                ))}
            </select>
          </div>
          <UserInfo user={user} />
        </div>
        <div className="flex items-center justify-center border border-dashed border-neutral-800">
          <div className="w-[500px] h-[300px] border border-dashed border-neutral-800"></div>
        </div>
        <div className="max-w-[300px] px-4 py-2 text-sm">
          <div className="flex justify-between">
            <p>APM</p>
            <p>435</p>
          </div>
          <div className="flex justify-between">
            <p>time</p>
            <p>12.343</p>
          </div>
          <div className="flex justify-between">
            <p>clicks</p>
            <p>52</p>
          </div>
          <div className="flex justify-between">
            <p>misses</p>
            <p>5</p>
          </div>
          <div className="flex justify-between">
            <p>type</p>
            <p>decrescent</p>
          </div>
          <div className="flex justify-between">
            <p>targets</p>
            <p>6</p>
          </div>
        </div>
      </div>
    </main>
  );
}
