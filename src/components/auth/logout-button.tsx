"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logout } from "@/services/auth";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-destructive text-destructive"
      onClick={() => {
        logout();
        router.replace("/login");
      }}
    >
      [ LOGOUT ]
    </Button>
  );
}
