export type EstacionEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';

export const CATAMARCA_DEPARTAMENTOS = [
  'Ambato',
  'Ancasti',
  'Andalgalá',
  'Antofagasta de la Sierra',
  'Belén',
  'Capayán',
  'Capital',
  'El Alto',
  'Fray Mamerto Esquiú',
  'La Paz',
  'Paclín',
  'Pomán',
  'Santa María',
  'Santa Rosa',
  'Tinogasta',
  'Valle Viejo',
] as const;

export type EstacionDepartamento = typeof CATAMARCA_DEPARTAMENTOS[number];

export interface Estacion {
  id: string;
  nombre: string;
  eslogan?: string;
  localidad: string;
  departamento?: EstacionDepartamento | string;
  descripcion_general?: string;
  latitud?: number;
  longitud?: number;
  foto_portada?: string;
  galeria_fotos?: string[];
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
  };
}
