import { Button } from "@/app/ui/button";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { OAuthButtons } from "./oauth-signin";
import {
  ArrowRightIcon,
  UserCircleIcon,
  KeyIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { emailLogin } from "./actions";

export default async function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/");
  }

  return (
    <main>
      <div className="w-full max-w-[80rem] min-h-screen mx-auto border-x border-dashed border-neutral-800 flex gap-4 py-4 flex-col">
        <div className="flex gap-4 max-w-full px-4 flex-col overflow-hidden items-center sm:flex-row sm:justify-between">
          <h1 className="text-2xl font-bold uppercase">apm test</h1>
        </div>
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
          <h2 className="text-2xl uppercase">login</h2>
          <form id="login-form" className="space-y-3">
            <div className="relative flex flex-1 flex-shrink-0">
              <label htmlFor="email" className="sr-only">
                email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="enter email"
                className="peer block w-full outline-1 border border-neutral-800 py-[9px] pl-10 text-sm placeholder:text-gray-500 bg-zinc-800/30"
                required
              />
              <UserCircleIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-100" />
            </div>
            <div className="relative flex flex-1 flex-shrink-0">
              <label htmlFor="password" className="sr-only">
                password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="enter password"
                className="peer block w-full outline-1 border border-neutral-800 py-[9px] pl-10 text-sm placeholder:text-gray-500 bg-zinc-800/30"
                required
                minLength={6}
              />
              <KeyIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-100" />
            </div>
            {searchParams.message && (
              <div className="text-sm font-medium text-destructive">
                {searchParams.message}
              </div>
            )}
            <div className="w-full mt-6 flex justify-end gap-2">
              <Button formAction={emailLogin} className="w-full">
                log in <ArrowRightIcon className="ml-auto h-5 w-5" />
              </Button>
            </div>
          </form>
          <OAuthButtons />
          <Link
            href="/signup"
            className="text-end transition-colors text-gray-400 hover:text-white"
          >
            create account
          </Link>
        </div>
      </div>
    </main>
  );
}
