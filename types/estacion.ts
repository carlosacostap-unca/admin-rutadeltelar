export type EstacionEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';

export interface Estacion {
  id: string;
  nombre: string;
  localidad: string;
  descripcion_general?: string;
  mapas_referencias?: string;
  coordenadas_generales?: string;
  estado: EstacionEstado;
  observaciones_revision?: string;
  created: string;
  updated: string;
  created_by?: string;
  updated_by?: string;
  expand?: {
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}
