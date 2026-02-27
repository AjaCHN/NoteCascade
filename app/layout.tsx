import type {Metadata, Viewport} from 'next';
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
  keywords: ['MIDI', 'Piano', 'Practice', 'Music', 'Game', 'Learning', 'Keyboard', 'Synthesizer'],
  authors: [{ name: 'Sut', url: 'https://github.com/sutchan' }],
  creator: 'Sut',
  publisher: 'Sut',
  robots: 'index, follow',
  openGraph: {
    title: `NoteCascade - Keyboard Practice v${version}`,
    description: 'A visual/game-like MIDI keyboard practice app with real-time scoring and achievements.',
    url: 'https://notecascade.app',
    siteName: 'NoteCascade',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NoteCascade Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `NoteCascade - Keyboard Practice v${version}`,
    description: 'A visual/game-like MIDI keyboard practice app with real-time scoring and achievements.',
    creator: '@sutchan',
    images: ['/og-image.png'],
  },
  other: {
    'geo.region': 'US',
    'geo.placename': 'Global',
    'geo.position': '37.7749;-122.4194',
    'ICBM': '37.7749, -122.4194',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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
