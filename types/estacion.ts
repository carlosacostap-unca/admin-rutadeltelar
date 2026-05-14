import { CatalogoItem } from '@/types/catalogo';

export type EstacionEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';
export type EstacionDepartamento = string;

export interface Estacion {
  id: string;
  nombre: string;
  eslogan?: string;
  posee_estacion_inaugurada?: boolean;
  localidad: string;
  departamento?: EstacionDepartamento | string;
  descripcion_general?: string;
  latitud?: number;
  longitud?: number;
  foto_portada?: string;
  foto_portada_focus_x?: number;
  foto_portada_focus_y?: number;
  galeria_fotos?: string[];
  galeria_fotos_focus?: Record<string, { x: number; y: number }>;
  fotos?: string[];
  estado: EstacionEstado;
  observaciones_revision?: string;
  created: string;
  updated: string;
  created_by?: string;
  updated_by?: string;
  expand?: {
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
    departamento?: CatalogoItem;
  };
}
