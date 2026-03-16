"use client";

import Link from "next/link";
import { Leaf, Menu, X, LogIn, User, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/interaction-checker", label: "Interaction Checker" },
  { href: "/health-assistant", label: "Health Assistant" },
  { href: "/blood-test", label: "Blood Test Analysis" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, isLoading, user, profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-emerald-600" />
          <span className="text-xl font-bold">
            Phyto<span className="text-emerald-600">therapy</span>.ai
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {/* Auth section — show nothing while loading to prevent flash */}
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-background shadow-lg">
                  <div className="border-b p-3">
                    {profile?.full_name && (
                      <p className="text-sm font-medium">{profile.full_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </div>
                  <div className="border-t p-1">
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 border-t pt-2">
            {isLoading ? (
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
            ) : isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 py-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">{profile?.full_name || user?.email}</span>
                </div>
                <Link
                  href="/profile"
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  className="block w-full py-2 text-left text-sm text-red-600 hover:text-red-700"
                  onClick={async () => {
                    setMobileOpen(false);
                    await signOut();
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                onClick={() => setMobileOpen(false)}
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
