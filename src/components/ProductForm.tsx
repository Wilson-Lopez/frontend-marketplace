"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, type DisplayProduct, type ProductInput } from "@/lib/api";

interface Props {
  open: boolean;
  editing: DisplayProduct | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/10";

const labelClass = "text-xs font-semibold text-slate-600";

export default function ProductForm({
  open,
  editing,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState("");
  const [categoria, setCategoria] = useState<string>("Otros");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setNombre(editing?.nombre ?? "");
      setPrecio(editing ? String(editing.precio) : "");
      setDescripcion(editing?.descripcion ?? "");
      setImagen(editing?.image ?? "");
      setCategoria(editing?.categoria ?? "Otros");
      setError("");
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precioNum = parseFloat(precio);
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    if (isNaN(precioNum) || precioNum <= 0)
      return setError("El precio debe ser un número mayor a 0.");
    onSubmit({
      nombre: nombre.trim(),
      precio: precioNum,
      descripcion: descripcion.trim() || undefined,
      imagen: imagen.trim() || undefined,
      categoria,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="fade-up relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="text-xs text-slate-400">
              {editing
                ? `Modificando el producto #${editing.id}`
                : "Completa los datos para publicar"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Preview + URL */}
          <div className="flex gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {imagen.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagen}
                  alt="Vista previa"
                  className="h-full w-full object-contain p-2"
                  onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                  onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                />
              ) : (
                <svg className="h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              )}
            </div>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className={labelClass}>URL de imagen</span>
              <input
                value={imagen}
                onChange={(e) => setImagen(e.target.value)}
                placeholder="https://ejemplo.com/foto.jpg"
                className={inputClass}
              />
              <span className="text-[11px] text-slate-400">
                Pega el enlace de una imagen (opcional).
              </span>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Nombre *</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Smartwatch Xiaomi Mi Band 9"
              maxLength={100}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Precio (PEN) *</span>
              <input
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                placeholder="199.90"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Categoría</span>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Descripción</span>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalles del producto..."
              className={`${inputClass} resize-none`}
            />
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {saving && (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
