import { SignIn } from '@clerk/nextjs';
import ShinyText from '@/components/ShinyText';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle metallic shine background elements */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px]"></div>
        
        {/* Metallic shine streaks */}
        <div className="absolute top-20 left-10 w-1 h-96 bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-12"></div>
        <div className="absolute top-32 right-16 w-1 h-80 bg-gradient-to-b from-transparent via-white/8 to-transparent -rotate-12"></div>
        <div className="absolute bottom-20 left-1/4 w-1 h-60 bg-gradient-to-b from-transparent via-white/6 to-transparent rotate-45"></div>
        
        {/* Floating metallic particles */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/5 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* EmpathAI Branding */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extralight tracking-wider mb-2">
            <ShinyText text="EmpathAI" disabled={false} speed={3} className="text-4xl font-extralight tracking-wider" />
          </h1>
          <p className="text-white/60 text-sm font-light tracking-wide">Your empathetic AI companion</p>
        </div>
        
        {/* Sign In Form Container */}
        <div className="w-full max-w-md relative">
          {/* Subtle metallic border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-2xl blur-sm"></div>
          <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <SignIn 
              routing="path" 
              path="/sign-in" 
              signUpUrl="/sign-up"
              redirectUrl="/"
              appearance={{
                variables: {
                  colorPrimary: '#ffffff',
                  colorBackground: 'transparent',
                  colorInputBackground: '#111111',
                  colorInputText: '#ffffff',
                  colorText: '#ffffff',
                  colorTextSecondary: '#a1a1aa',
                  colorNeutral: '#ffffff',
                  borderRadius: '0.75rem',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                elements: {
                  card: 'bg-transparent shadow-none border-none',
                  headerTitle: 'text-white font-light text-2xl tracking-wide',
                  headerSubtitle: 'text-zinc-400 font-light',
                  formButtonPrimary: 'bg-white text-black hover:bg-white/90 font-medium transition-all duration-200 shadow-lg hover:shadow-white/25',
                  formFieldInput: 'bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-white/30 transition-all duration-200',
                  formFieldLabel: 'text-zinc-300 font-light',
                  socialButtonsBlockButton: 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 text-white transition-all duration-200',
                  socialButtonsBlockButtonText: 'text-white font-light',
                  footerActionLink: 'text-white hover:text-white/80 font-light',
                  dividerLine: 'bg-zinc-800',
                  dividerText: 'text-zinc-500 font-light',
                },
              }}
            />
          </div>
        </div>
        
        {/* Bottom branding */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs font-light tracking-widest">WELCOME BACK</p>
        </div>
      </div>
    </div>
  );
}
