import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoLoop AI",
  description: "Autonomous building energy optimization platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  );
}
