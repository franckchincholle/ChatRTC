import '@/styles/variables.css';
import '@/styles/global.css';
import '@/styles/components.css';
import '@/styles/auth.css';
import '@/styles/chat.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServerProvider } from '@/contexts/ServerContext';
import { ChannelProvider } from '@/contexts/ChannelContext';
import { MessageProvider } from '@/contexts/MessageContext';
import { MemberProvider } from '@/contexts/MemberContext';

export const metadata = {
  title: 'RTC — Real Time Chat',
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
          <ServerProvider>
            <ChannelProvider>
              <MemberProvider>
                <MessageProvider>
                  {children}
                </MessageProvider>
              </MemberProvider>
            </ChannelProvider>
          </ServerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}