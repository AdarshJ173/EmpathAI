'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser, useSignIn, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, ChevronDown } from 'lucide-react';
import './SignInButton.css';

interface SignInButtonProps {
  text?: string;
  onClick?: () => void;
}

const SignInButton: React.FC<SignInButtonProps> = ({ 
  text,
  onClick
}) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signIn } = useSignIn();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowDropdown(false);
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('SignInButton handleClick triggered');
    
    // If custom onClick is provided, use that
    if (onClick) {
      onClick();
      return;
    }

    try {
      if (!isLoaded) {
        console.log('Clerk not loaded yet');
        return;
      }

      if (isSignedIn) {
        // Toggle dropdown for signed-in users
        setShowDropdown(!showDropdown);
      } else {
        // User is not signed in, redirect to sign-in page
        console.log('Redirecting to sign-in page');
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Fallback to sign-in page
      router.push('/sign-in');
    }
  };

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <button className="button" disabled type="button">
        <div className="blob1"></div>
        <div className="blob2"></div>
        <div className="inner">Loading...</div>
      </button>
    );
  }

  // Dynamic text based on auth state
  const buttonText = text || (isSignedIn ? user?.firstName || 'Profile' : 'Sign In');

  return (
    <div className="relative" ref={dropdownRef}>
      <button className="button" onClick={handleClick} type="button">
        <div className="blob1"></div>
        <div className="blob2"></div>
        <div className="inner flex items-center gap-1">
          <span>{buttonText}</span>
          {isSignedIn && (
            <ChevronDown 
              className={`w-3 h-3 transition-transform duration-200 ${
                showDropdown ? 'rotate-180' : ''
              }`} 
            />
          )}
        </div>
      </button>

      {/* Minimalistic Dropdown Menu */}
      <AnimatePresence>
        {isSignedIn && showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full right-0 mt-3 min-w-[200px] z-[100]"
          >
            {/* Metallic shine backdrop */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent rounded-xl blur-sm"></div>
            
            {/* Main dropdown container */}
            <div className="relative bg-black/95 backdrop-blur-md rounded-xl border border-white/[0.08] overflow-hidden">
              {/* Subtle metallic shine line at top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* User info section - super minimal */}
              <div className="px-4 py-3">
                <div className="text-white/90 text-sm font-light mb-1 truncate">
                  {user?.firstName || 'User'}
                </div>
                <div className="text-white/40 text-xs font-extralight truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>

              {/* Subtle divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mx-4"></div>

              {/* Sign out button */}
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="group w-full px-3 py-2 text-left text-white/70 hover:text-white rounded-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/[0.04] relative overflow-hidden"
                >
                  {/* Metallic shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                  
                  <LogOut className="w-3.5 h-3.5 relative z-10" />
                  <span className="text-sm font-light relative z-10">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignInButton;
