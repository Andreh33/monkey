"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Edit3, Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ProductDeleteButton } from "./ProductDeleteButton";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  active: boolean;
  images: { url: string }[];
};

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function AdminProductsTable({ products }: { products: ProductRow[] }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const indexedProducts = useMemo(() => products.map(product => ({
    product,
    text: normalizeSearch([product.name, product.sku, product.brand, product.category, product.id, product.slug].filter(Boolean).join(" ")),
  })), [products]);
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const filteredProducts = terms.length
    ? indexedProducts.filter(({ text }) => terms.every(term => text.includes(term))).map(({ product }) => product)
    : products;

  return (
    <>
      <div role="search" aria-label="Buscar productos del admin" className="mb-5">
        <label htmlFor="admin-products-search" className="mb-2 block text-sm font-semibold">Buscar productos</label>
        <div className="relative max-w-xl">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input ref={inputRef} id="admin-products-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nombre, marca o referencia…" autoComplete="off" maxLength={160} aria-describedby="admin-products-search-help" className="input-base pl-10 pr-12" />
          {query && <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Limpiar búsqueda" className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded text-text-secondary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-red"><X aria-hidden="true" size={18} /></button>}
        </div>
        <p id="admin-products-search-help" className="mt-2 text-xs text-text-muted">Busca también entre los productos ocultos. No hace falta escribir el nombre completo.</p>
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm text-text-secondary">{filteredProducts.length} de {products.length} productos</p>
      </div>
      <div className="card-base overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-tertiary">
            <tr className="text-left text-xs uppercase tracking-widest font-mono text-text-muted">
              <th className="px-4 py-3 w-16"></th>
              <th className="px-4 py-3">Producto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-bg-tertiary/30">
                <td className="px-4 py-3">
                  <div className="relative w-12 h-14 rounded overflow-hidden bg-bg-tertiary">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="48px" className="object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-sm">{p.name}</p>
                  {p.brand && <p className="text-xs text-text-muted">{p.brand}</p>}
                  {p.sku && <p className="text-xs text-text-muted">Ref.: {p.sku}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-text-secondary capitalize">{p.category}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPrice(p.price)}€</td>
                <td className="px-4 py-3 text-center font-mono">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {p.featured && <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded bg-accent-orange/20 text-accent-orange">Destacado</span>}
                    <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-mono rounded ${p.active ? "bg-success/20 text-success" : "bg-text-muted/20 text-text-muted"}`}>
                      {p.active ? "Activo" : "Oculto"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Link href={`/admin/productos/${p.id}`} className="p-2 rounded hover:bg-bg-tertiary text-text-secondary hover:text-white" aria-label="Editar">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <ProductDeleteButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-text-muted">{terms.length ? "No hay productos que coincidan con la búsqueda." : "No hay productos. Añade el primero."}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
