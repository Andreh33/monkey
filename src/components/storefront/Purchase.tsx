"use client";
import { useState } from "react";
import Link from "next/link";
import { purchaseEligible } from "@/lib/purchase";
import { localePath, type Locale } from "@/lib/storefront-routes";
import type { StoreCopy } from "@/lib/storefront-copy";
type Labels = Pick<
  StoreCopy,
  | "buy"
  | "accept"
  | "conditions"
  | "privacy"
  | "and"
  | "delivery"
  | "soldOut"
  | "unavailable"
  | "contact"
>;
export function Purchase({
  product,
  locale,
  labels: d,
}: {
  product: { active: boolean; stock: number; stripeLink: string };
  locale: Locale;
  labels: Labels;
}) {
  const [accepted, setAccepted] = useState(false);
  const available = purchaseEligible(product, true);
  return (
    <div className="space-y-5" id="comprar">
      <p className="text-sm text-text-secondary leading-relaxed">
        {d.delivery}
      </p>
      {available ? (
        <>
          <label className="flex gap-3 text-sm leading-relaxed text-text-secondary">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="accent-orange-500 mt-1 h-4 w-4 shrink-0"
            />
            <span>
              {d.accept}{" "}
              <Link
                target="_blank"
                className="text-accent-orange underline"
                href={localePath(locale, "/condiciones-compra")}
              >
                {d.conditions}
              </Link>{" "}
              {d.and}{" "}
              <Link
                target="_blank"
                className="text-accent-orange underline"
                href={localePath(locale, "/privacidad")}
              >
                {d.privacy}
              </Link>
              .
            </span>
          </label>
          <button
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!purchaseEligible(product, accepted)}
            onClick={() => {
              if (purchaseEligible(product, accepted))
                window.open(
                  product.stripeLink,
                  "_blank",
                  "noopener,noreferrer",
                );
            }}
          >
            {d.buy} ↗
          </button>
        </>
      ) : (
        <div role="status" className="rounded-lg border border-border p-4">
          <p>{product.stock <= 0 ? d.soldOut : d.unavailable}</p>
          <Link
            href={localePath(locale, "/contacto")}
            className="text-accent-orange underline"
          >
            {d.contact}
          </Link>
        </div>
      )}
    </div>
  );
}
