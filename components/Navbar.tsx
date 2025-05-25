"use client";
import { useState } from 'react'
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link'
import Image from 'next/image'
import { AlignRight , X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Cari Produk', href: '/cari-produk' },
  { name: 'Beranda', href: '/' }
]

export default function Navbar(){
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <>
    <header className="fixed w-full bg-white bg-opacity-50 backdrop-blur-sm drop-shadow-2xl z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center space-x-2 lg:ms-28">
        <Link href="/dashboard">
          <Image src="/images/logoo.png" alt="Logo" width={70} height={0}/>
        </Link>
          <h1 className="font-semibold text-2xl text-green-400 font-bold cursor-pointer">Rise and Care</h1>
        </div>
        <div className="hidden md:flex items-center space-x-6 ml-auto lg:me-28">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-black hover:text-green-400 transition-colors duration-300"
            >
              {item.name}
            </Link>
          ))}
          <UserButton afterSignOutUrl="/" />
        </div>
        
        <div className="md:hidden ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-black flex justify-end" />
            ) : (
              <AlignRight  className="h-6 w-6 text-black" />
            )}
          </Button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-black hover:text-green-400 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
          <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      )}
    </header>
    </>
  )
}

/*
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Activity, Settings } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/track",
      label: "Track",
      icon: Activity,
      active: pathname === "/track",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Rice Care</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "relative px-3 py-2 text-sm transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <span className="relative z-10">{route.label}</span>
                {route.active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-primary/10 rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation }*/
      /*
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center p-2 text-xs",
                route.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <route.icon size={20} />
              <span>{route.label}</span>
              {route.active && (
                <motion.div
                  layoutId="mobile-navbar-active"
                  className="absolute bottom-0 h-0.5 w-12 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;*/