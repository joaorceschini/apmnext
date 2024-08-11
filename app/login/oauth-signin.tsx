"use client";
import { Button } from "@/app/ui/button";
import { Provider } from "@supabase/supabase-js";
import { Github } from "lucide-react";
import { oAuthSignIn } from "./actions";

type OAuthProvider = {
  name: Provider;
  displayName: string;
  icon?: JSX.Element;
};

export function OAuthButtons() {
  const oAuthProviders: OAuthProvider[] = [
    {
      name: "github",
      displayName: "GitHub",
      icon: <Github className="size-5" />,
    },
  ];

  return (
    <>
      {oAuthProviders.map((provider) => (
        <Button
          onClick={async () => {
            await oAuthSignIn(provider.name);
          }}
        >
          login with {provider.displayName}{" "}
          <div className="ml-auto h-5 w-5">{provider.icon}</div>
        </Button>
      ))}
    </>
  );
}
