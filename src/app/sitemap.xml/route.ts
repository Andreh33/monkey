import sitemap from "@/lib/sitemap";
import { serializeSitemap } from "@/lib/sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  return new Response(serializeSitemap(await sitemap()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
