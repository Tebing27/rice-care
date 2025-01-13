'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlignRight , X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs';

const navItems = [
  { name: 'Beranda', href: '/' },
  { name: 'Profil', href: '#profil' },
  { name: 'Fitur', href: '#fitur' },
]

export default function Header(){
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <>
    <header className="fixed w-full bg-white bg-opacity-50 backdrop-blur-sm drop-shadow-2xl z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center space-x-2 lg:ms-28">
        <Link href="/">
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
          {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link href="/sign-in">
            <Button size="sm" variant="green">Login</Button>
          </Link>
        )}
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
            
          <Link href="/sign-in">
            <div className="px-3 py-2">
              <Button size="sm" variant="green" className="w-full">Login</Button>
            </div>
          </Link>
          </div>
        </div>
      )}
    </header>
    </>
  )
}