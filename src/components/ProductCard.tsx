"use client";

import { useState } from "react";
import type { DisplayProduct } from "@/lib/api";

function formatPrice(value: number) {
  return value.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${
              i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
            }`}
            fill="currentColor"
          >
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

interface Props {
  product: DisplayProduct;
  index: number;
  onEdit: (p: DisplayProduct) => void;
  onDelete: (p: DisplayProduct) => void;
  onImport: (p: DisplayProduct) => void;
  importedDone?: boolean;
}

export default function ProductCard({
  product,
  index,
  onEdit,
  onDelete,
  onImport,
  importedDone = false,
}: Props) {
  const isPublic = product.source === "public";
  const [imgError, setImgError] = useState(false);
  const showImage = product.image && !imgError;

  return (
    <article
      className="fade-up group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
      style={{ animationDelay: `${(index % 8) * 45}ms` }}
    >
      {/* Imagen */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-slate-50 p-6">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image as string}
            alt={product.nombre}
            onError={() => setImgError(true)}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-300">
            <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}

        {/* Badge de categoría */}
        {product.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            {product.categoria}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-slate-800">
          {product.nombre}
        </h3>

        {product.rating !== null ? (
          <Stars rating={product.rating} />
        ) : (
          <p className="clamp-1 text-xs text-slate-400">
            {product.descripcion || "Sin descripción"}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {formatPrice(product.precio)}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-4 pb-4">
        {isPublic ? (
          <button
            onClick={() => onImport(product)}
            disabled={importedDone}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              importedDone
                ? "cursor-default bg-emerald-50 text-emerald-700"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {importedDone ? (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Importado
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
                Importar
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => onDelete(product)}
              aria-label="Eliminar"
              className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
