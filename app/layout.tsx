import './globals.css';
import ReminderGlobalBar from './_components/ReminderGlobalBar';

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
        <ReminderGlobalBar />
        {children}
      </body>
    </html>
  );
}
