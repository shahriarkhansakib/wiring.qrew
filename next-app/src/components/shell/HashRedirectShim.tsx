"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mapHashToPath } from "@/lib/routes";

export function HashRedirectShim() {
  const router = useRouter();

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (!hash || hash === "#" || hash === "#landing") return;
      const targetPath = mapHashToPath(hash);
      if (targetPath && targetPath !== "/") {
        router.replace(targetPath);
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [router]);

  return null;
}
