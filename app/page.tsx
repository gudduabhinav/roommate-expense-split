import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Zap, ShieldCheck, Smartphone } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <h1 className="text-5xl md:text-7xl font-bold font-poppins leading-tight">
              Split expenses, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                keep the peace.
              </span>
            </h1>
            <p className="text-lg text-foreground/60 max-w-lg">
              The colorful, trustworthy way to split bills with roommates, friends, and flatmates. No more awkward "who owes whom" conversations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth?mode=signup"
                className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold text-lg flex items-center gap-2 hover:scale-105 transition-transform card-shadow"
              >
                Get Started <ArrowRight size={20} />
              </Link>
              <button className="bg-white dark:bg-slate-800 text-foreground px-8 py-4 rounded-2xl font-semibold text-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <Smartphone size={20} /> Install App
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-foreground/50">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-slate-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <span>Trusted by 50,000+ roommates</span>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right duration-1000">
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 rounded-full blur-3xl opacity-50" />
            <div className="rounded-[2.5rem] overflow-hidden card-shadow border-4 border-white/50 dark:border-slate-800/50">
              <Image
                src="/hero-illustration.png"
                alt="Roommates sharing expenses"
                width={800}
                height={800}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-50 dark:bg-slate-900/50 py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold font-poppins">Everything you need</h2>
              <p className="text-foreground/60">Features built for the modern roommate life.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="text-primary" />,
                  title: "Group Splitting",
                  desc: "Create groups for rent, groceries, or trips. Split equally or by share."
                },
                {
                  icon: <Zap className="text-secondary" />,
                  title: "Smart Settlements",
                  desc: "Minimize transactions with our smart settlement engine. Clear debts in one click."
                },
                {
                  icon: <ShieldCheck className="text-success" />,
                  title: "Cloud Backup",
                  desc: "Securely stored with Supabase. Access your balances from any device, anytime."
                }
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-poppins">{f.title}</h3>
                  <p className="text-foreground/60">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <span className="font-bold text-primary">SplitSmart</span>
          </div>
          <div className="flex gap-8 text-sm text-foreground/50">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
          <p className="text-sm text-foreground/40">© 2026 SplitSmart Inc. Built with ❤️ for roommates.</p>
        </div>
      </footer>
    </div>
  );
}
