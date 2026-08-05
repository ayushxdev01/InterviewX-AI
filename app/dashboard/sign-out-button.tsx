"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, RefreshCw } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleSwitchAccount() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSwitchAccount}
        className="flex items-center gap-2 text-sm text-muted hover:text-signal transition-colors"
      >
        <RefreshCw size={16} />
        Switch account
      </button>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}