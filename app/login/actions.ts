"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

export async function emailLogin(formData: FormData) {
  const supabase = createClient();

  try {
    const LoginFormSchema = z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(6, { message: "password must be longer than 6 characters" }),
    });

    const data = LoginFormSchema.parse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      redirect("/login?message=could not authenticate user");
    }
  } catch (error: any) {
    console.log(error.issues[0].message);
    redirect(`/login?message=${error.issues[0].message}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
