import './globals.css';
import ReminderGlobalBar from './_components/ReminderGlobalBar';
import { CasesProvider } from './cases/_context/CasesContext';
import { InventoryProvider } from './inventory/_context/InventoryContext';
import { CaseNotificationAlert } from './cases/_components/CaseNotificationAlert';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <InventoryProvider>
          <CasesProvider>
            <ReminderGlobalBar />
            {children}
            <CaseNotificationAlert />
          </CasesProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
