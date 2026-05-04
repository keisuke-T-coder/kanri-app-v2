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
          --primary: #eaaa43; /* V2のメインカラー（オレンジ）に合わせる */
          --background: #f8f6f0; /* メインメニューと同じ背景色 */
          --foreground: #1e293b;
          --card: #ffffff;
          --card-foreground: #1e293b;
          --border: rgba(0, 0, 0, 0.05);
          color: var(--foreground);
          background: var(--background);
        }

        /* 
           ダークモード時でも「明るいUI」を維持するように調整 
           (ユーザーの要望により、見やすさ優先)
        */
        @media (prefers-color-scheme: dark) {
          .cases-module {
            --background: #f1f5f9; /* ダークモード時は少しだけ落とした白 */
            --foreground: #0f172a;
            --card: #ffffff;
            --card-foreground: #0f172a;
          }
        }

        .glass {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
