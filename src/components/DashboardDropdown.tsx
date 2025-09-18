"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Heart, 
  AlertTriangle, 
  Stethoscope,
  BarChart3,
  ChevronDown
} from "lucide-react";

interface DropdownItem {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const dashboardItems: DropdownItem[] = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    title: "Dashboard Home",
    description: "Overview of your wellness journey",
    color: "text-blue-600"
  },
  {
    href: "/dashboard/erp-support",
    icon: <Heart className="w-4 h-4" />,
    title: "ERP Support Center",
    description: "Structured exposure therapy tools",
    color: "text-purple-600"
  },
  {
    href: "/dashboard/immediate-support",
    icon: <AlertTriangle className="w-4 h-4" />,
    title: "Immediate Support",
    description: "Crisis support & coping tools",
    color: "text-red-600"
  },
  {
    href: "/dashboard/therapist-portal",
    icon: <Stethoscope className="w-4 h-4" />,
    title: "Therapist Portal",
    description: "Professional insights & progress",
    color: "text-green-600"
  }
];

export default function DashboardDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredIndex(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.15
      }
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.15
      }
    })
  };

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dashboard Trigger Button */}
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-light opacity-60 hover:opacity-100 transition-all duration-300 rounded-md hover:bg-accent/20">
        <LayoutDashboard className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute top-full left-0 mt-2 w-80 bg-background/95 backdrop-blur-xl rounded-xl shadow-2xl border border-border/30 overflow-hidden z-50"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/20 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Mental Wellness Dashboard</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {dashboardItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <Link 
                    href={item.href}
                    className={`block p-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                      hoveredIndex === index 
                        ? 'bg-accent/30 border-l-2 border-primary' 
                        : 'hover:bg-accent/10'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setIsOpen(false)}
                  >
                    {/* Hover Effect Background */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="relative flex items-start gap-3">
                      <div className={`p-2 rounded-md ${item.color} bg-current/10 group-hover:bg-current/20 transition-colors`}>
                        <div className={item.color}>
                          {item.icon}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className={`opacity-0 group-hover:opacity-100 transition-all duration-200 transform ${
                        hoveredIndex === index ? 'translate-x-0' : 'translate-x-2'
                      }`}>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-border/20 bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                🌟 Your mental wellness journey starts here
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
