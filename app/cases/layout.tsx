"use client";

import { CasesProvider } from "./_context/CasesContext";

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="cases-module min-h-screen font-sans">
      <CasesProvider>
        {children}
      </CasesProvider>

      <style jsx global>{`
        .cases-module {
          --primary: #6366f1;
          --background: #f8fafc;
          --foreground: #0f172a;
          --card: #ffffff;
          --card-foreground: #0f172a;
          --border: #e2e8f0;
          color: var(--foreground);
          background: var(--background);
        }

        @media (prefers-color-scheme: dark) {
          .cases-module {
            --background: #0f172a;
            --foreground: #f8fafc;
            --card: #1e293b;
            --card-foreground: #f8fafc;
            --border: #334155;
          }
        }

        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        @media (prefers-color-scheme: dark) {
          .glass {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
