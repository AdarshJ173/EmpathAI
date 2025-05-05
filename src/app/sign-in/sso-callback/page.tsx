"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Simple redirect to home after a brief delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h3 className="text-xl font-light text-primary">Processing sign-in...</h3>
        <p className="text-sm text-muted-foreground">You'll be redirected shortly</p>
      </div>
    </div>
  );
} 