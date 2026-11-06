"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { importFileSchema, IMPORT_BATCH_SIZE, IMPORT_MAX_FILE_BYTES, type ImportProduct } from "@/lib/product-import";

const money = (value: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

export function ProductImport() {
  const [products, setProducts] = useState<ImportProduct[]>([]);
  const [fileName, setFileName] = useState("");
  const [reading, setReading] = useState(false);
  const [running, setRunning] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [inserted, setInserted] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [error, setError] = useState("");
  const runningRef = useRef(false);
  const pauseRef = useRef(false);
  const complete = products.length > 0 && processed === products.length;

  async function readFile(file?: File) {
    if (!file || runningRef.current) return;
    setProducts([]); setFileName(file.name); setProcessed(0); setInserted(0); setSkipped(0); setError("");
    setReading(true);
    try {
      if (file.size > IMPORT_MAX_FILE_BYTES) throw new Error("El archivo supera el límite de 125 MB.");
      const parsed = importFileSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        const issues = parsed.error.issues.slice(0, 8).map(issue => {
          const index = issue.path[0] === "products" && typeof issue.path[1] === "number" ? `Producto ${issue.path[1] + 1}: ` : "";
          return index + issue.message;
        });
        throw new Error(issues.join("\n"));
      }
      setProducts(parsed.data.products);
    } catch (err) {
      setError(err instanceof SyntaxError ? "El archivo no contiene un JSON válido." : err instanceof Error ? err.message : "No se pudo leer el archivo.");
    } finally { setReading(false); }
  }

  async function importAll() {
    if (runningRef.current || !products.length || complete) return;
    runningRef.current = true; pauseRef.current = false; setRunning(true); setError("");
    try {
      for (let start = processed; start < products.length; start += IMPORT_BATCH_SIZE) {
        if (pauseRef.current) break;
        const batch = products.slice(start, start + IMPORT_BATCH_SIZE);
        const response = await fetch("/api/admin/productos/importar", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ products: batch }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.ok) {
          const details = result?.issues?.slice(0, 3).map((issue: { message: string }) => issue.message).join(" ");
          throw new Error(response.status === 403
            ? "Tu sesión de administrador ha caducado. Inicia sesión de nuevo y vuelve a cargar el archivo; las fichas ya importadas se conservarán."
            : [result?.error || "No se ha podido confirmar el lote.", details, `Se ha detenido en el producto ${start + 1}. Puedes reintentarlo.`].filter(Boolean).join(" "));
        }
        setInserted(value => value + result.inserted);
        setSkipped(value => value + result.skipped);
        setProcessed(start + batch.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido confirmar el lote. Puedes reintentarlo sin duplicar fichas.");
    } finally { runningRef.current = false; setRunning(false); }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-md mb-3">Importar borradores</h1>
        <p className="text-text-secondary max-w-3xl">Carga el archivo preparado y revisa las fichas antes de guardarlas. Todas quedarán ocultas, con cinco unidades de stock y sin enlace de pago. Los productos existentes se conservan.</p>
      </div>
      <section className="card-base p-6 space-y-4">
        <label className="block">
          <span className="label-base">Archivo JSON de productos</span>
          <input type="file" accept=".json,application/json" disabled={reading || running} onChange={event => void readFile(event.target.files?.[0])} className="input-base file:mr-4 file:rounded file:border-0 file:px-3 file:py-2 disabled:opacity-50" />
        </label>
        {reading && <p role="status">Revisando archivo…</p>}
        {products.length > 0 && <p><strong>{products.length.toLocaleString("es-ES")} fichas</strong> · {new Set(products.map(p => p.category)).size} categorías · {fileName}</p>}
        <p className="text-sm text-text-muted">Se comprueba el aumento del 10 %, las variantes y las imágenes antes de comenzar. Una ficha existente con el mismo identificador o SKU se omite.</p>
      </section>
      {error && <div role="alert" className="rounded-lg border border-accent-red p-4 whitespace-pre-line">{error}</div>}
      {products.length > 0 && <>
        <section className="card-base p-6 space-y-4">
          <div className="flex gap-4 items-center flex-wrap">
            <button type="button" className="btn-primary disabled:opacity-50" disabled={running || reading || complete} onClick={() => void importAll()}>
              {running ? "Importando…" : complete ? "Importación terminada" : processed ? "Continuar importación" : "Importar todos como borradores"}
            </button>
            {running && <button type="button" className="btn-outline" onClick={() => { pauseRef.current = true; }}>Pausar al terminar el lote</button>}
            <Link href="/admin/productos" className="text-accent-orange underline">Ver productos</Link>
          </div>
          <progress aria-label="Progreso de importación" max={products.length} value={processed} className="w-full h-3 accent-accent-orange" />
          <p role="status" aria-live="polite">{processed.toLocaleString("es-ES")} de {products.length.toLocaleString("es-ES")} procesadas · {inserted.toLocaleString("es-ES")} borradores creados · {skipped.toLocaleString("es-ES")} fichas existentes omitidas</p>
          {!complete && <p className="text-sm text-text-muted">Mantén esta página abierta mientras se importan las fichas. Puedes volver a cargar el mismo archivo si se interrumpe la conexión.</p>}
        </section>
        <section className="card-base overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="text-left p-4 text-text-secondary">Vista previa de las primeras {Math.min(50, products.length)} fichas. Todas se guardarán como borradores.</caption>
            <thead><tr className="text-left border-y border-border"><th className="p-3">Producto / variante</th><th className="p-3">Categoría</th><th className="p-3">Fotos</th><th className="p-3 text-right">Precio de origen</th><th className="p-3 text-right">Precio +10 %</th></tr></thead>
            <tbody>{products.slice(0, 50).map(product => <tr key={product.id} className="border-b border-border">
              <td className="p-3">{product.name}</td><td className="p-3">{product.categoryName}{product.subcategoryName ? ` / ${product.subcategoryName}` : ""}</td><td className="p-3">{product.images.length}</td><td className="p-3 text-right font-mono">{money(product.sourcePriceCents / 100)}</td><td className="p-3 text-right font-mono">{money(product.price)}</td>
            </tr>)}</tbody>
          </table>
        </section>
      </>}
    </div>
  );
}
