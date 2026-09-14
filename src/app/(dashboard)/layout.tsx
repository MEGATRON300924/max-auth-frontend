"use client";

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-base text-ink">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <DashboardSidebar className="hidden lg:flex" />
          <div className="flex min-w-0 flex-1 flex-col">
            <DashboardHeader />
            <main className="flex-1 px-4 pb-12 pt-3 sm:px-6 lg:px-10 lg:pt-5">
              <div className="mx-auto w-full max-w-[980px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
