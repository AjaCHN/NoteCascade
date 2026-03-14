// app/components/ui/button.tsx v2.3.1
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export function Button({ variant = 'default', className = '', ...props }: ButtonProps) {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
}
