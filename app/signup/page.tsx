import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Header from "@/app/ui/header";
import SignupForm from "../ui/signup/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "signup",
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
              <p>create account</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 px-4 py-2 max-w-[250px]">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
