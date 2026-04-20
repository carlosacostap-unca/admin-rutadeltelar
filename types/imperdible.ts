import { CatalogoItem } from '@/types/catalogo';

export type ImperdibleEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';
export type ImperdibleTipo = string;
export type ImperdiblePrioridad = string;

export interface Imperdible {
  id: string;
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  tipo: ImperdibleTipo | string;
  fecha_hora_evento?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  duracion_sugerida?: string;
  recomendaciones?: string;
  accesibilidad?: string;
  actores_relacionados?: string[]; // Relación con la colección actores
  productos_relacionados?: string[]; // Relación con la colección productos
  experiencias_relacionadas?: string[]; // Relación con la colección experiencias
  horarios?: string;
  estacionalidad?: string;
  prioridad: ImperdiblePrioridad | string;
  estacion_id: string; // Relación con la colección estaciones
  fotos?: string[]; // URLs o nombres de archivo de PocketBase
  videos_enlaces?: string;
  estado: ImperdibleEstado;
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
    tipo?: CatalogoItem;
    prioridad?: CatalogoItem;
    actores_relacionados?: {
      id: string;
      nombre: string;
      tipo: string;
    }[];
    productos_relacionados?: {
      id: string;
      nombre: string;
      categoria: string;
    }[];
    experiencias_relacionadas?: {
      id: string;
      titulo: string;
      categoria: string;
    }[];
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}
