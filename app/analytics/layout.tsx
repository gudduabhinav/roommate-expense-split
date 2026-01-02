import { Sidebar, BottomNav } from "@/components/common/navigation";

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#0f172a]">
            <Sidebar />
            <main className="flex-grow pb-24 md:pb-0 relative">
                {children}
                <BottomNav />
            </main>
        </div>
    );
}
