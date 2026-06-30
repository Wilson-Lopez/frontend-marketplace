"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  backend,
  publicStore,
  CATEGORIES,
  type DisplayProduct,
  type ProductInput,
} from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";

type Toast = { id: number; msg: string; tone: "ok" | "error" };

const FILTERS = ["Todos", ...CATEGORIES] as const;

export default function Home() {
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todos");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DisplayProduct | null>(null);
  const [saving, setSaving] = useState(false);

  const [confirm, setConfirm] = useState<DisplayProduct | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Importación desde el catálogo global
  const [importOpen, setImportOpen] = useState(false);
  const [pub, setPub] = useState<DisplayProduct[]>([]);
  const [pubLoading, setPubLoading] = useState(false);

  const pushToast = (msg: string, tone: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.floor(performance.now());
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await backend.list());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar al backend");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openImport = async () => {
    setImportOpen(true);
    if (pub.length === 0) {
      setPubLoading(true);
      try {
        setPub(await publicStore.list());
      } catch {
        pushToast("No se pudo cargar el catálogo global", "error");
      } finally {
        setPubLoading(false);
      }
    }
  };

  const handleSubmit = async (input: ProductInput) => {
    setSaving(true);
    try {
      if (editing) {
        await backend.update(editing.id, input);
        pushToast("Producto actualizado correctamente");
      } else {
        await backend.create(input);
        pushToast("Producto creado correctamente");
      }
      setFormOpen(false);
      setEditing(null);
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: DisplayProduct) => {
    try {
      await backend.remove(p.id);
      pushToast("Producto eliminado");
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Error al eliminar", "error");
    } finally {
      setConfirm(null);
    }
  };

  const [imported, setImported] = useState<Set<string>>(new Set());
  const handleImport = async (p: DisplayProduct) => {
    try {
      await backend.create({
        nombre: p.nombre.slice(0, 100),
        precio: p.precio,
        descripcion: p.descripcion ?? undefined,
        imagen: p.image ?? undefined,
        categoria: p.categoria ?? "Otros",
      });
      setImported((s) => new Set(s).add(String(p.id)));
      pushToast("Producto importado a tu catálogo");
      await load();
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Error al importar", "error");
    }
  };

  // Conteo por categoría
  const counts = useMemo(() => {
    const map: Record<string, number> = { Todos: products.length };
    for (const c of CATEGORIES) map[c] = 0;
    for (const p of products) {
      const k = p.categoria ?? "Otros";
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [products]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const okCat = cat === "Todos" || (p.categoria ?? "Otros") === cat;
      const okQ = !q || p.nombre.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [products, query, cat]);

  return (
    <div className="min-h-full">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l1-5h16l1 5M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18M9 13h6" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold tracking-tight text-slate-900">Central</p>
              <p className="-mt-0.5 text-[11px] text-slate-400">Store</p>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative mx-auto hidden w-full max-w-md sm:block">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <button
              onClick={openImport}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12M8 11l4 4 4-4M4 19h16" />
              </svg>
              <span className="hidden md:inline">Importar</span>
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="hidden sm:inline">Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Encabezado de sección */}
      <section className="mx-auto max-w-7xl px-5 pt-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Catálogo de productos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Explora y filtra por categoría. Importa productos del catálogo global para llenar tu tienda.
        </p>

        {/* Filtros por categoría */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setCat(f)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                cat === f
                  ? "border-brand bg-brand text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  cat === f ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[f] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Buscador móvil */}
        <div className="relative mt-4 sm:hidden">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand focus:bg-white"
          />
        </div>
      </section>

      {/* Contenido */}
      <main className="mx-auto max-w-7xl px-5 py-6">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
            <span>{error}. Verifica que tu backend esté corriendo en el puerto 3001.</span>
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : items.length === 0 ? (
          <EmptyState
            searching={!!query.trim() || cat !== "Todos"}
            onCreate={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            onImport={openImport}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-400">
              {items.length} producto{items.length !== 1 && "s"}
              {cat !== "Todos" && ` en ${cat}`}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onEdit={(prod) => {
                    setEditing(prod);
                    setFormOpen(true);
                  }}
                  onDelete={(prod) => setConfirm(prod)}
                  onImport={handleImport}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="mt-10 border-t border-slate-200 py-8 text-center">
        <p className="text-sm text-slate-400">
          Laboratorio terminado- 2026 Tecsup
        </p>
      </footer>

      {/* Modal formulario */}
      <ProductForm
        open={formOpen}
        editing={editing}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* Drawer/Modal de importación */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Cerrar"
            onClick={() => setImportOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fade-up relative flex h-full w-full max-w-2xl flex-col bg-canvas shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Catálogo global</h2>
                <p className="text-xs text-slate-400">
                  Productos reales de Fake Store API. Impórtalos a tu tienda.
                </p>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {pubLoading ? (
                <SkeletonGrid small />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {pub.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      index={i}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onImport={handleImport}
                      importedDone={imported.has(String(p.id))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de borrado */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Cerrar"
            onClick={() => setConfirm(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <div className="fade-up relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Eliminar producto</h3>
            <p className="mt-1 text-sm text-slate-500">
              ¿Seguro que deseas eliminar{" "}
              <span className="font-semibold text-slate-700">{confirm.nombre}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`fade-up flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.tone === "ok" ? "bg-slate-900" : "bg-red-600"
            }`}
          >
            {t.tone === "ok" ? (
              <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            )}
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonGrid({ small }: { small?: boolean }) {
  return (
    <div
      className={`grid gap-4 ${
        small ? "grid-cols-2" : "grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      }`}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="shimmer aspect-square" />
          <div className="space-y-3 p-4">
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-6 w-1/2 rounded" />
            <div className="shimmer h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  searching,
  onCreate,
  onImport,
}: {
  searching: boolean;
  onCreate: () => void;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l1-5h16l1 5M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">
          {searching ? "Sin resultados" : "Aún no hay productos"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {searching
            ? "Prueba con otra categoría o término de búsqueda."
            : "Crea un producto o importa del catálogo global."}
        </p>
      </div>
      {!searching && (
        <div className="flex gap-3">
          <button
            onClick={onImport}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Importar productos
          </button>
          <button
            onClick={onCreate}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Crear producto
          </button>
        </div>
      )}
    </div>
  );
}
