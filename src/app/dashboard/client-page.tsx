"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function ClientDashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated after Clerk has loaded
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-extralight tracking-wide text-primary">Client Dashboard</h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            Welcome, {user?.firstName || "User"}
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-medium mb-4">Your Profile</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.fullName || "User"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.primaryEmailAddress?.emailAddress || "No email"}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-medium mb-4">AI Interaction Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Total Conversations</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Minutes Talked</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="text-muted-foreground">Topics Explored</span>
              <span className="font-medium">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 