"use client";

import { createClient } from "@/utils/supabase/client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { signup } from "@/app/signup/actions";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const supabase = createClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string[]>([]);

  const checkIfExists = useCallback(async () => {
    const errors: string[] = [];
    setMessage([]);

    try {
      const [{ count: usernameCount }, { count: emailCount }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("username", { count: "exact", head: true })
            .eq("username", username),
          supabase
            .from("profiles")
            .select("email", { count: "exact", head: true })
            .eq("email", email),
        ]);

      if (usernameCount) errors.push("username already exists");
      if (emailCount) errors.push("email already exists");

      setMessage(errors);
      return errors.length === 0;
    } catch (error) {
      setMessage(["an error occurred while checking your details"]);
      return false;
    }
  }, [username, email, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await checkIfExists();
    if (!isValid) return;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    const result = await signup(formData);

    if (!result.success) {
      setMessage([result.message]);
    }
  };

  return (
    <form id="signup-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="enter username"
          className="w-full bg-transparent outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="enter email"
          className="w-full bg-transparent outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          className="w-full bg-transparent outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      {message.length > 0 && (
        <div className="text-sm text-destructive text-red-400">
          {message.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      )}
      <div className="flex justify-between mt-2">
        <button className="button primary block" type="submit">
          create account
        </button>
        <Link href="/login" className="text-start opacity-50 hover:opacity-100">
          login
        </Link>
      </div>
    </form>
  );
}
