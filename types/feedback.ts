export type FeedbackEntityType =
  | 'estaciones'
  | 'actores'
  | 'productos'
  | 'experiencias'
  | 'imperdibles';

export interface ComentarioEntidad {
  id: string;
  entidad_tipo: FeedbackEntityType | string;
  entidad_id: string;
  comentario: string;
  autor_nombre?: string;
  created: string;
}

export interface PuntuacionEntidad {
  id: string;
  entidad_tipo: FeedbackEntityType | string;
  entidad_id: string;
  puntuacion: number;
  comentario?: string;
  autor_nombre?: string;
  created: string;
}
