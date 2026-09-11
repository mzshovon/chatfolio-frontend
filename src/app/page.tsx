import Image from "next/image";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import { ChatfolioSearch } from "@/components/home/ChatfolioSearch";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Image
          src="/Logo-light.png"
          alt="Chatfolio"
          width={178}
          height={89}
          className="h-12 w-auto sm:h-14 dark:hidden"
          priority
        />
        <Image
          src="/Logo-dark.png"
          alt="Chatfolio"
          width={178}
          height={89}
          className="hidden h-12 w-auto sm:h-14 dark:block"
          priority
        />
        <ThemeToggle />
      </header>

      <div className="flex flex-1 flex-col items-center gap-5 px-6 pt-6 pb-10 text-center sm:pt-10">
        <div className="flex flex-col items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover dark:text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Built for recruiters who move fast
          </span>
          <h1 className="max-w-xl text-2xl font-semibold text-text-primary sm:text-3xl">
            Skip the resume — chat with a candidate&apos;s real story.
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-text-secondary">
            Search by name, role, or location, then ask their AI about skills, projects,
            availability, or how to reach them. Grounded answers, no waiting on a callback.
          </p>
        </div>

        <ChatfolioSearch />

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-accent" />
            Answers in seconds, not a follow-up email
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5 text-accent" />
            Grounded in the candidate&apos;s real profile
          </span>
        </div>
      </div>

      <footer className="px-6 py-6 text-center text-xs text-text-secondary">
        &copy; 2026 Chatfolio. All rights reserved.
      </footer>

      <FeedbackWidget />
    </main>
  );
}
