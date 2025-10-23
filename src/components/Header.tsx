"use client";

import { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import NextLink from "next/link";
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-white/30 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NextLink href="/" className="text-xl font-bold text-gray-900">
              Koopi
            </NextLink>
          </div>

          <div className="hidden md:flex items-center gap-x-6 lg:gap-x-8">
            {isHomePage && (
              <>
                <ScrollLink to="features" smooth={true} duration={500} spy={true} offset={-50} className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </ScrollLink>
                <ScrollLink to="about" smooth={true} duration={500} spy={true} offset={-50} className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  About
                </ScrollLink>
              </>
            )}
            {user ? (
              <NextLink href="/dashboard" className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-md active:scale-95">
                Dashboard
              </NextLink>
            ) : (
              <div className="flex items-center gap-x-4">
                <NextLink href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </NextLink>
                <NextLink
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors shadow-md active:scale-95"
                >
                  Start Free
                </NextLink>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-4 space-y-3">
            {isHomePage && (
              <>
                <ScrollLink to="features" smooth={true} duration={500} spy={true} offset={-50} onClick={() => setMobileMenuOpen(false)} className="cursor-pointer block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Features
                </ScrollLink>
                <ScrollLink to="about" smooth={true} duration={500} spy={true} offset={-50} onClick={() => setMobileMenuOpen(false)} className="cursor-pointer block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  About
                </ScrollLink>
              </>
            )}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {user ? (
                <NextLink href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-blue-500 rounded-full hover:bg-blue-600">
                  Dashboard
                </NextLink>
              ) : (
                <div className="space-y-3">
                  <NextLink href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    Log in
                  </NextLink>
                  <NextLink
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 text-sm font-medium text-center text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  >
                    Start Free
                  </NextLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
