"use client";
import { useState, type FormEvent } from "react";
import type { StoreCopy } from "@/lib/storefront-copy";
export function LocalContactForm({
  labels: d,
}: {
  labels: Pick<
    StoreCopy,
    | "name"
    | "email"
    | "phone"
    | "message"
    | "send"
    | "sending"
    | "sent"
    | "error"
  >;
}) {
  const [busy, setBusy] = useState(false),
    [status, setStatus] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setStatus("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      if (!res.ok) throw new Error();
      form.reset();
      setStatus(d.sent);
    } catch {
      setStatus(d.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      {[
        ["name", d.name, "text"],
        ["email", d.email, "email"],
        ["phone", d.phone, "tel"],
      ].map(([field, label, type]) => (
        <label className="block" key={field}>
          <span className="label-base">
            {label}
            {field !== "phone" ? " *" : ""}
          </span>
          <input
            className="input-base"
            name={field}
            type={type}
            required={field !== "phone"}
            minLength={field === "name" ? 2 : undefined}
            maxLength={200}
            autoComplete={
              field === "name" ? "name" : field === "email" ? "email" : "tel"
            }
          />
        </label>
      ))}
      <label className="block">
        <span className="label-base">{d.message} *</span>
        <textarea
          name="message"
          rows={6}
          className="input-base"
          required
          minLength={5}
          maxLength={5000}
        />
      </label>
      <button
        disabled={busy}
        className="btn-primary w-full disabled:opacity-50"
      >
        {busy ? d.sending : d.send}
      </button>
      <p role="status" className="text-sm text-text-secondary">
        {status}
      </p>
    </form>
  );
}
