import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymOS — Smart Gym Management System",
  description: "Cloud-based, multi-tenant gym management platform for gym operators, members, and personal trainers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#F4F5F7] text-[#171B28]">{children}</body>
    </html>
  );
}
