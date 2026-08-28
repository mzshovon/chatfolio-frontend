import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { fetchChatfolioPage } from "@/lib/api/publicChat.server";

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const result = await fetchChatfolioPage(slug);

  if (result.kind !== "ok") {
    return { title: "Chatfolio" };
  }

  const { full_name, title } = result.data;
  return {
    title: `Chat with ${full_name} · Chatfolio`,
    description: title
      ? `Ask an AI grounded in ${full_name}'s profile about their work as a ${title}.`
      : `Ask an AI grounded in ${full_name}'s profile.`,
  };
}

export default async function ChatfolioPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const result = await fetchChatfolioPage(slug);

  if (result.kind === "not-found") {
    notFound();
  }

  if (result.kind === "redirect") {
    redirect(`/${result.slug}`);
  }

  return <ChatWidget data={result.data} />;
}
