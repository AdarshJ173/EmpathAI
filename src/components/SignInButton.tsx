'use client';

import React from 'react';
import './SignInButton.css';

interface SignInButtonProps {
  text?: string;
  onClick?: () => void;
}

const SignInButton: React.FC<SignInButtonProps> = ({ 
  text = 'Sign In', 
  onClick = () => {} 
}) => {
  return (
    <button className="button" onClick={onClick}>
      <div className="blob1"></div>
      <div className="blob2"></div>
      <div className="inner">{text}</div>
    </button>
  );
};

export default SignInButton;
