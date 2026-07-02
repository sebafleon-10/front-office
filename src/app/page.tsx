import { HomeClient } from "@/components/HomeClient";
import { hasStateParams, parseUrlState } from "@/lib/url-state";

interface PageProps {
  // A Promise in Next 16 — must be awaited.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <HomeClient initialState={parseUrlState(sp)} fromUrl={hasStateParams(sp)} />
  );
}
