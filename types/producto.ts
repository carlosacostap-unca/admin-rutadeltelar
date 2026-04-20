import { CatalogoItem } from '@/types/catalogo';

export type ProductoEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';
export type ProductoCategoria = string;

export interface Producto {
  id: string;
  nombre: string;
  categoria: ProductoCategoria | string;
  subcategoria?: string;
  tecnicas?: string[];
  descripcion?: string;
  estacion_id?: string; // Relación legacy con una estación principal
  estaciones_relacionadas?: string[];
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
    estaciones_relacionadas?: Array<{
      id: string;
      nombre: string;
      localidad: string;
    }>;
    categoria?: CatalogoItem;
    subcategoria?: CatalogoItem;
    tecnicas?: CatalogoItem[];
    actores_relacionados?: {
      id: string;
      nombre: string;
      tipo: string;
      expand?: {
        tipo?: CatalogoItem;
        estacion_id?: {
          id: string;
          nombre: string;
          localidad: string;
        };
      };
    }[];
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}
