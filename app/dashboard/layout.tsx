import { Sidebar, BottomNav } from "@/components/common/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-24 md:pb-8 pt-6 px-4 md:px-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}