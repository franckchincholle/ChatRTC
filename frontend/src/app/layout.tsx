import '@/styles/global.css';
import '@/styles/variables.css';
import '@/styles/auth.css';
import '@/styles/chat.css';
import '@/styles/components.css';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: 'RTC - Real Time Chat',
  description: 'Application de chat en temps réel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}