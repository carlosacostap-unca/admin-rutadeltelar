export type ActorTipo = 'artesano' | 'productor' | 'hospedaje' | 'gastronomico' | 'guia';
export type ActorEstado = 'borrador' | 'en_revision' | 'aprobado' | 'inactivo';

export interface Actor {
  id: string;
  nombre: string;
  tipo: ActorTipo;
  estacion_id: string; // Relación con la colección estaciones
  descripcion?: string; // Biografía corta o descripción
  contacto_telefono?: string;
  contacto_email?: string;
  ubicacion?: string; // Dirección o georreferenciación
  estado: ActorEstado;
  observaciones_revision?: string;
  
  // --- Campos específicos según el tipo de actor ---
  
  // Artesano
  tecnicas?: string;
  materiales?: string;
  
  // Productor
  rubro_productivo?: string;
  escala_produccion?: string;
  modalidad_venta?: string;
  
  // Artesano y Productor
  productos_ofrecidos?: string;
  visitas_demostraciones?: boolean;
  
  // Hospedaje
  tipo_hospedaje?: string;
  capacidad?: string;
  servicios?: string; // Servicios disponibles
  
  // Gastronómico
  tipo_propuesta?: string;
  especialidades?: string;
  platos_destacados?: string;
  modalidad_servicio?: string;
  servicios_adicionales?: string;
  
  // Guía de turismo
  especialidad?: string;
  idiomas?: string;
  recorridos_ofrecidos?: string;
  duracion_recorridos?: string;
  zona_cobertura?: string;
  punto_encuentro?: string;
  acreditacion?: string; // Matrícula o habilitación
  
  // Campos compartidos por varios subtipos (Hospedaje, Gastronómico, Guía)
  horarios?: string; // Horarios de atención o check-in/check-out
  disponibilidad?: string;
  observaciones?: string; // Observaciones internas
  
  // Multimedia
  // fotos?: string[]; // Para cuando se implementen archivos en PocketBase
  
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
    created_by?: { name: string; email: string };
    updated_by?: { name: string; email: string };
  };
}
