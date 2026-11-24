import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dr. KG Mokoena | General Practitioner Pretoria",
  description: "Premier General Practitioner & Family Medicine in Brooklyn, Pretoria. Book appointments online with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
