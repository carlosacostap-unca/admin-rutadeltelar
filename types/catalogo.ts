export interface CatalogoItem {
  id: string;
  nombre: string;
  activo?: boolean;
  created?: string;
  updated?: string;
}

export type CatalogoCollectionName =
  | 'tipos_actor'
  | 'categorias_producto'
  | 'tecnicas_producto'
  | 'categorias_experiencia'
  | 'tipos_imperdible'
  | 'prioridades_imperdible'
  | 'departamentos';

export const CATALOGOS_CONFIG: Array<{
  collectionName: CatalogoCollectionName;
  title: string;
}> = [
  { collectionName: 'tipos_actor', title: 'Tipos de Actor' },
  { collectionName: 'categorias_producto', title: 'Categorías de Producto' },
  { collectionName: 'tecnicas_producto', title: 'Técnicas de Producto' },
  { collectionName: 'categorias_experiencia', title: 'Categorías de Experiencia' },
  { collectionName: 'tipos_imperdible', title: 'Tipos de Imperdible' },
  { collectionName: 'prioridades_imperdible', title: 'Prioridades de Imperdible' },
  { collectionName: 'departamentos', title: 'Departamentos' },
];
