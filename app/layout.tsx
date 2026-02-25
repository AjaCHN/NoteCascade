import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import pkg from '../package.json';

const { version } = pkg;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: `NoteCascade - Keyboard Practice v${version}`,
  description: 'A visual/game-like MIDI keyboard practice app with real-time scoring and achievements.',
  keywords: ['MIDI', 'Piano', 'Practice', 'Music', 'Game', 'Learning'],
  authors: [{ name: 'Sut' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                  const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
                  const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
                  if (resizeObserverErr) resizeObserverErr.setAttribute('style', 'display: none');
                  if (resizeObserverErrDiv) resizeObserverErrDiv.setAttribute('style', 'display: none');
                  e.stopImmediatePropagation();
                }
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans">{children}</body>
    </html>
  );
}
