export type ExperienciaEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';
export type ExperienciaCategoria = 'taller' | 'recorrido' | 'degustacion' | 'demostracion' | 'convivencia' | 'otros';

export interface Experiencia {
  id: string;
  titulo: string;
  categoria: ExperienciaCategoria | string;
  descripcion?: string;
  duracion?: string;
  recomendaciones?: string;
  responsable?: string; // Relación con la colección actores (un solo actor)
  ubicacion?: string;
  estacion_id: string; // Relación con la colección estaciones
  fotos?: string[]; // URLs o nombres de archivo de PocketBase
  estado: ExperienciaEstado;
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
    responsable?: {
      id: string;
      nombre: string;
      tipo: string;
    };
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}
