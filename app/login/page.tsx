import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { emailLogin } from "./actions";
import Header from "@/app/ui/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "login",
};

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
      <div className="w-full max-w-[80rem] min-h-screen mx-auto flex gap-4 pb-4 flex-col text-sm">
        <Header />
        <div className="flex flex-col gap-4">
          <div className="flex max-w-full px-4 justify-between text-sm">
            <div className="flex max-w-full items-start">
              <p>login</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-4 py-2 max-w-[250px]">
            <form id="login-form">
              <div>
                <label htmlFor="email" className="sr-only">
                  email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="enter email"
                  className="w-full bg-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="enter password"
                  className="w-full bg-transparent outline-none"
                  required
                  minLength={6}
                />
              </div>
              {searchParams.message && (
                <div className="text-sm font-medium text-destructive">
                  {searchParams.message}
                </div>
              )}
              <div className="flex justify-between mt-2">
                <button
                  className="button primary block"
                  formAction={emailLogin}
                >
                  login
                </button>
                <Link
                  href="/signup"
                  className="text-start opacity-50 hover:opacity-100"
                >
                  create account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
