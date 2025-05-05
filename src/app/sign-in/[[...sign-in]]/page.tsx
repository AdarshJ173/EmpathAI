import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extralight tracking-wide text-primary">
            EmpathAI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personal AI companion
          </p>
        </div>
        
        <div className="w-full flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                card: "shadow-none border border-border rounded-lg",
                headerTitle: "text-primary",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "border-border text-primary",
                formFieldLabel: "text-primary",
                formFieldInput: "border-border text-primary",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:text-primary/90",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
} 