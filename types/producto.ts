export type ProductoEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';
export type ProductoCategoria = 'textil' | 'ceramica' | 'madera' | 'metal' | 'cuero' | 'gastronomia' | 'otros';

export interface Producto {
  id: string;
  nombre: string;
  categoria: ProductoCategoria | string;
  descripcion?: string;
  estacion_id: string; // Relación con la colección estaciones
  actores_relacionados?: string[]; // Relación múltiple con la colección actores
  fotos?: string[]; // URLs o nombres de archivo de PocketBase
  estado: ProductoEstado;
  observaciones_revision?: string;
  created: string;
  updated: string;
  created_by?: string;
  updated_by?: string;
  
  // Para PocketBase expand
  expand?: {
    estacion_id?: {
      id: string;
      nombre: string;
      localidad: string;
    };
    actores_relacionados?: {
      id: string;
      nombre: string;
      tipo: string;
    }[];
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}