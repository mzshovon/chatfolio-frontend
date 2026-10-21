import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { CandidateSearch } from "@/components/home/CandidateSearch";
import { IntroPrompt } from "@/components/recruiter/IntroPrompt";
import { RecruiterHeader } from "@/components/layout/RecruiterHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { buttonClasses } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <IntroPrompt id="home" />
      <RecruiterHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-[1080px] px-4 pt-11 pb-7 text-center sm:px-6">
          <h1 className="font-display text-[clamp(32px,4.4vw,50px)] leading-[1.08] font-semibold tracking-[-0.01em] text-balance text-text-primary">
            Skip the CV pile. <em className="text-accent">Ask the candidate.</em>
          </h1>
          <p className="mx-auto mt-3.5 max-w-[600px] text-[17px] leading-relaxed text-pretty text-text-secondary">
            Search, then chat with each candidate&apos;s AI. Answers come only from their approved profile.
          </p>
        </section>

        <CandidateSearch />

        <section className="mx-auto max-w-[1240px] px-4 pt-14 pb-10 sm:px-6">
          <div className="flex flex-wrap items-center gap-6 rounded-3xl bg-hero px-9 py-8 text-hero-text">
            <div className="min-w-[260px] flex-1">
              <div className="font-display text-[26px] leading-tight font-semibold">Looking for work yourself?</div>
              <p className="mt-1.5 text-[14.5px] text-hero-muted">
                Upload your CV and get a chatfolio that answers recruiters like these, 24/7. Free.
              </p>
            </div>
            <a href="https://panel.chatfolio.net/register" className={buttonClasses("primary", "px-[22px] py-3 text-[15px]")}>
              Create my Chatfolio
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
      <FeedbackWidget />
    </div>
  );
}
