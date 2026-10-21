import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import { RecruiterProvider } from "@/components/recruiter/RecruiterProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Chatfolio",
  description: "Chat with a candidate's AI-grounded portfolio.",
  icons: {
    icon: "/chatfolio-icon.png",
    shortcut: "/chatfolio-icon.png",
    apple: "/chatfolio-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-bg text-text-primary">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RecruiterProvider>{children}</RecruiterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
