import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { Suspense } from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
        <p className="text-white text-lg">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthenticateWithRedirectCallback />
    </Suspense>
  );
}
