"use client";
import React, { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useUserStore();
  const [loading, setLoading] = useState(false);

  async function handleLogOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          logout(); // Clear user store
          router.push("/login"); // redirect to login page
        },
        onRequest: (ctx) => {
          setLoading(true);
        },
        onResponse: (ctx) => {
          setLoading(false);
        },
      },
    });
  }
  return (
    <button 
      onClick={() => handleLogOut()}
      className="w-full text-left"
      disabled={loading}
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
