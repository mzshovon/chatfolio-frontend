import Image from "next/image";
import { MessageCircle, Sparkles, Zap } from "lucide-react";
import { ChatfolioSearch } from "@/components/home/ChatfolioSearch";
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

      <div className="flex flex-1 flex-col items-center justify-center gap-9 px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-hover dark:text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Built for recruiters who move fast
          </span>
          <h1 className="max-w-xl text-3xl font-semibold text-text-primary sm:text-4xl">
            Skip the résumé.
            <br className="hidden sm:block" /> Chat straight with a candidate&apos;s real story.
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            Every candidate here has a living Chatfolio — search by name, role, or location,
            then ask their AI anything: skills, projects, availability, or how to get in touch.
            Grounded answers, no guesswork, no waiting on a callback.
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
    </main>
  );
}
