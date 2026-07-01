"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/**
 * Renderiza el cuerpo Markdown del artículo con estilos de marca (.article-prose).
 * Los enlaces internos ("/...") usan next/link; los externos abren en nueva pestaña.
 * Es un client component para máxima compatibilidad; el HTML se prerenderiza en
 * build (SSG), por lo que el contenido es 100% indexable.
 */
export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="article-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          a: ({ href = "", children }) => {
            if (href.startsWith("/")) {
              return <Link href={href}>{children}</Link>;
            }
            const external = /^https?:\/\//i.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
