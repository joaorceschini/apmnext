"use server";

import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

export async function signup(formData: FormData) {
  const supabase = createClient();

  try {
    const SignupFormSchema = z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(6, { message: "password must be longer than 6 characters" }),
      options: z.object({
        data: z.object({
          username: z
            .string({
              required_error: "username is required",
            })
            .min(3, { message: "enter a username" })
            .max(16, {
              message: "username must be between 3 and 16 characters",
            }),
          email: z.string().email(),
        }),
      }),
    });

    const data = SignupFormSchema.parse({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: {
          username: formData.get("username") as string,
          email: formData.get("email") as string,
        },
      },
    });

    const { error } = await supabase.auth.signUp(data);

    if (error) {
      return { success: false, message: error.message || "error signing up" };
    }

    return { success: true, message: "confirm your email before logging in" };
  } catch (error: any) {
    console.log("signup error:", error);
    return {
      success: false,
      message: error.issues[0]?.message || "invalid input data",
    };
  }
}
