import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LearnSmart – Master Skills, Not Just Scores',
  description: 'AI-powered adaptive learning platform using Bayesian Knowledge Tracing and IRT. Master Data Structures & Algorithms with personalized quizzes, skill tracking, and explainable recommendations.',
  keywords: ['AI learning', 'adaptive quiz', 'DSA', 'data structures', 'algorithms', 'mastery learning'],
  openGraph: {
    title: 'LearnSmart – AI-Powered Personalized Learning',
    description: 'Adaptive learning platform with Bayesian Knowledge Tracing',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('ls-theme');
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.body.classList.add('light');
                }
              } catch(e) {}
            `,
          }}
        />
        <div className="gradient-bg min-h-screen">
          <Navbar />
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
