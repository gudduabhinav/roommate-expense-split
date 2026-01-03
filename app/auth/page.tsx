"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, User, Wallet } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            full_name: `${firstName} ${lastName}`.trim()
                        }
                    }
                });
                if (error) throw error;
                setSuccess("Check your email for confirmation!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            <Link
                href="/"
                className="absolute top-8 left-8 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-foreground/60 hover:text-primary transition-all hover:scale-110 active:scale-95"
            >
                <ArrowLeft size={24} />
            </Link>

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 card-shadow border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Wallet size={40} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-bold font-poppins mb-2">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-foreground/60">
                        {isSignUp ? "Join SplitSmart today" : "Log in to your account"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    {isSignUp && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-2">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                                    <input
                                        type="text"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold ml-2">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-danger/10 text-danger text-sm p-4 rounded-xl border border-danger/20">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-success/10 text-success text-sm p-4 rounded-xl border border-success/20">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : isSignUp ? "Sign Up" : "Login"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary font-semibold hover:underline"
                    >
                        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-sm text-foreground/40 px-4">
                        By continuing, you agree to SplitSmart's Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
