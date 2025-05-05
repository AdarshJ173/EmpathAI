import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Check authentication
    const { userId } = auth();
    
    // If not authenticated, redirect to sign-in
    if (!userId) {
      return redirect("/sign-in");
    }
    
    // User is authenticated
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  } catch (error) {
    // If there's an error with authentication, redirect to sign-in
    console.error("Authentication error:", error);
    return redirect("/sign-in");
  }
} 