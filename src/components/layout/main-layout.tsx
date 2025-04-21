import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffbe9] via-[#fef7fa] to-[#dbfbff] transition-colors duration-700">
      <main className={cn("pt-16 pb-12", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Toaster position="bottom-right" expand richColors closeButton />
    </div>
  );
}