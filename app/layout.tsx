import {Poppins} from "next/font/google";
import { Providers } from './providers';
import type { Metadata } from "next";
import "./globals.css";

// Define your font with options
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WordWeaver AI",
  description: "AI-powered essay writing assistant for students and professionals. Create well-structured essays in minutes, not hours.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}