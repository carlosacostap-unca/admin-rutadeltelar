'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import Link from 'next/link';

interface DraftItem {
  id: string;
  collectionName: string;
  title: string;
  subtitle: string;
  updated: string;
  estado: string;
}

export default function BorradoresPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Solo permitir a admin y editor
    if (!isLoading && user) {
      const userRoles = (user as any).roles || [];
      const isAllowed = userRoles.includes('admin') || userRoles.includes('editor');
      if (!isAllowed) {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchDraftItems() {
      if (!user) return;
      try {
        setLoading(true);
        const collections = ['estaciones', 'actores', 'productos', 'experiencias', 'imperdibles'];
        let allItems: DraftItem[] = [];

        for (const collection of collections) {
          try {
            const records = await pb.collection(collection).getFullList({
              filter: 'estado="borrador"',
              sort: '-updated',
            });

            const mapped = records.map(record => {
              // Determinar el campo de título dependiendo de la colección
              let title = record.nombre || record.titulo || 'Sin título';
              let subtitle = '';
              
              if (collection === 'estaciones') subtitle = record.localidad || 'Sin localidad';
              if (collection === 'actores') subtitle = record.tipo || 'Sin tipo';
              if (collection === 'productos') subtitle = record.categoria || 'Sin categoría';
              if (collection === 'experiencias') subtitle = record.categoria || 'Sin categoría';
              if (collection === 'imperdibles') subtitle = record.tipo || 'Sin tipo';

              return {
                id: record.id,
                collectionName: collection,
                title,
                subtitle,
                updated: record.updated,
                estado: record.estado
              };
            });

            allItems = [...allItems, ...mapped];
          } catch (e) {
            console.error(`Error fetching from ${collection}:`, e);
          }
        }

        // Sort all by updated descending
        allItems.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
        setItems(allItems);
      } catch (error) {
        console.error('Error fetching draft items:', error);
      } finally {
        setLoading(false);
      }
    }

    const userRoles = (user as any)?.roles || [];
    const isAllowed = userRoles.includes('admin') || userRoles.includes('editor');
    if (isAllowed) {
      fetchDraftItems();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const userRoles = (user as any).roles || [];
  const isAllowed = userRoles.includes('admin') || userRoles.includes('editor');
  if (!isAllowed) {
    return null; // El useEffect redirigirá
  }

  // Agrupar por colección
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.collectionName]) acc[item.collectionName] = [];
    acc[item.collectionName].push(item);
    return acc;
  }, {} as Record<string, DraftItem[]>);

  const collectionsLabels: Record<string, string> = {
    'estaciones': 'Estaciones',
    'actores': 'Actores',
    'productos': 'Productos',
    'experiencias': 'Experiencias',
    'imperdibles': 'Imperdibles'
  };

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
            Borradores
          </h2>
        </div>

        <div className="bg-[var(--color-surface-container)] p-6 rounded-md mb-6 shadow-sm border-none">
          <p className="text-[var(--color-on-surface-variant)] text-sm">
            Aquí se muestran todos los elementos que están actualmente en estado <strong>"Borrador"</strong>. 
            Puedes continuar editándolos y, cuando estén listos, enviarlos a revisión.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {loading ? (
            <p className="p-8 text-center text-[var(--color-on-surface-variant)]">Cargando borradores...</p>
          ) : items.length === 0 ? (
            <div className="bg-[var(--color-surface-container)] p-8 text-center text-[var(--color-on-surface-variant)] rounded-md">
              No tienes ningún elemento en estado borrador actualmente.
            </div>
          ) : (
            Object.entries(collectionsLabels).map(([colKey, colLabel]) => {
              const colItems = groupedItems[colKey] || [];
              if (colItems.length === 0) return null;

              return (
                <div key={colKey} className="flex flex-col gap-3">
                  <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-[var(--color-surface-variant)] pb-2 mb-2 uppercase tracking-wider text-sm">
                    {colLabel} <span className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] px-2 py-0.5 rounded-full text-xs ml-2">{colItems.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {colItems.map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/${item.collectionName}/${item.id}`}
                        className="bg-[var(--color-surface-container)] p-5 rounded-xl hover:bg-[var(--color-surface-container-low)] transition-all shadow-sm flex flex-col gap-2 cursor-pointer border border-[var(--color-surface-variant)]"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-md font-bold text-[var(--color-primary)]">{item.title}</h4>
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.05em] shrink-0 bg-gray-200 text-gray-800">
                            BORRADOR
                          </span>
                        </div>
                        <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center justify-between mt-1">
                          <span>{item.subtitle}</span>
                          <span className="text-xs">Actualizado: {new Date(item.updated).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}