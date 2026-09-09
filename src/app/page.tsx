import Image from "next/image";
import { HomeSlugForm } from "@/components/home/HomeSlugForm";
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

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">
            Chat with a candidate&apos;s portfolio
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-text-secondary">
            Every published Chatfolio has its own page — open a candidate&apos;s link to see
            their profile and chat with an AI grounded in it.
          </p>
        </div>

        <HomeSlugForm />
      </div>
    </main>
  );
}
