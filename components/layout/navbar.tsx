"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Wallet, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-white/20"
                    : "py-6 bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group focus:outline-none">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform duration-300">
                            <Wallet size={22} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold font-poppins tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-600 to-secondary leading-none">
                            SplitSmart
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground/40 leading-none mt-1">
                            Keep the peace
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Features</Link>
                    <Link href="#testimonials" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Testimonials</Link>
                    <Link href="#faq" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">FAQ</Link>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                    <Link
                        href="/auth"
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-2"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/auth?mode=signup"
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] flex items-center gap-2"
                    >
                        Join Now <ArrowRight size={16} />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-foreground p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-6">
                        <Link href="#features" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                        <Link href="#testimonials" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
                        <Link href="#faq" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
                        <hr className="border-slate-100 dark:border-slate-800" />
                        <Link href="/auth" className="text-lg font-medium" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                        <Link
                            href="/auth?mode=signup"
                            className="bg-primary text-white py-4 rounded-xl font-bold text-center shadow-lg"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
