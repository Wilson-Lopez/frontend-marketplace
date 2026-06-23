// Cliente de API.
// Combina dos fuentes:
//  1) Tu backend propio (Express + MySQL)  -> CRUD completo
//  2) Fake Store API (pública)             -> solo lectura + importar
// La URL del backend se puede sobreescribir con NEXT_PUBLIC_API_URL en .env.local

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const PUBLIC_API_URL = "https://fakestoreapi.com";

// Categorías disponibles en la tienda
export const CATEGORIES = [
  "Ropa",
  "Accesorios",
  "Electrodomésticos",
  "Tecnología",
  "Otros",
] as const;

export type Categoria = (typeof CATEGORIES)[number];

// Traduce las categorías de la API pública (Fake Store) a las nuestras
function mapCategoria(raw: string): Categoria {
  const c = raw.toLowerCase();
  if (c.includes("clothing")) return "Ropa";
  if (c.includes("jewel")) return "Accesorios";
  if (c.includes("electronic")) return "Tecnología";
  return "Otros";
}

// ---- Tipo unificado que usa la UI ----
export interface DisplayProduct {
  id: number | string;
  nombre: string;
  precio: number;
  descripcion: string | null;
  image: string | null;
  categoria: string | null;
  rating: number | null;
  source: "local" | "public";
}

export interface ProductInput {
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
  categoria?: string;
}

// ---- Formas crudas de cada API ----
interface BackendProduct {
  id: number;
  nombre: string;
  precio: string | number;
  descripcion: string | null;
  imagen: string | null;
  categoria: string | null;
}

interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function handleBackend<T>(res: Response): Promise<ApiResponse<T>> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.message || `Error ${res.status}`);
  }
  return json;
}

function toNumber(v: string | number): number {
  return typeof v === "string" ? parseFloat(v) : v;
}

// ---------- BACKEND PROPIO ----------
export const backend = {
  async list(): Promise<DisplayProduct[]> {
    const res = await fetch(`${API_URL}/products`, { cache: "no-store" });
    const json = await handleBackend<BackendProduct[]>(res);
    return json.data.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      precio: toNumber(p.precio),
      descripcion: p.descripcion,
      image: p.imagen ?? null,
      categoria: p.categoria ?? "Otros",
      rating: null,
      source: "local" as const,
    }));
  },

  async create(input: ProductInput): Promise<void> {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    await handleBackend<BackendProduct>(res);
  },

  async update(id: number | string, input: ProductInput): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    await handleBackend<BackendProduct>(res);
  },

  async remove(id: number | string): Promise<void> {
    const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
    await handleBackend<null>(res);
  },
};

// ---------- API PÚBLICA (Fake Store) ----------
export const publicStore = {
  async list(): Promise<DisplayProduct[]> {
    const res = await fetch(`${PUBLIC_API_URL}/products?limit=20`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("No se pudo cargar el catálogo público");
    const data = (await res.json()) as FakeStoreProduct[];
    return data.map((p) => ({
      id: `pub-${p.id}`,
      nombre: p.title,
      precio: p.price,
      descripcion: p.description,
      image: p.image,
      categoria: mapCategoria(p.category),
      rating: p.rating?.rate ?? null,
      source: "public" as const,
    }));
  },
};
