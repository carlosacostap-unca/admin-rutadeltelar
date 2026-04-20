'use client';

import { useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbase';
import { buildCatalogoSort } from '@/lib/catalogos';
import { CatalogoCollectionName, CatalogoItem } from '@/types/catalogo';
import { useAuth } from '@/contexts/AuthContext';
import { hasAnyRole } from '@/lib/permissions';

interface CatalogTagSelectorProps {
  collectionName: CatalogoCollectionName;
  value: string[];
  onChange: (value: string[]) => void;
  emptyLabel?: string;
}

export default function CatalogTagSelector({
  collectionName,
  value,
  onChange,
  emptyLabel = 'No hay opciones disponibles.',
}: CatalogTagSelectorProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreateItems = hasAnyRole(user as any, ['admin']);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      try {
        setError(null);
        const records = await pb.collection(collectionName).getFullList<CatalogoItem>({
          filter: 'activo = true',
          sort: buildCatalogoSort(),
          requestKey: null,
        });

        if (!cancelled) {
          setItems(records);
        }
      } catch (error) {
        console.error(`Error fetching catalog items from ${collectionName}:`, error);
        if (!cancelled) {
          setError('No se pudieron cargar las opciones.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [collectionName]);

  const selectedItems = useMemo(
    () => items.filter((item) => value.includes(item.id)),
    [items, value]
  );

  const toggleValue = (itemId: string) => {
    if (value.includes(itemId)) {
      onChange(value.filter((currentId) => currentId !== itemId));
    } else {
      onChange([...value, itemId]);
    }
  };

  const handleCreate = async () => {
    const nombre = newItemName.trim();
    if (!nombre || !canCreateItems) return;

    setIsCreating(true);
    setError(null);
    try {
      const created = await pb.collection(collectionName).create<CatalogoItem>({
        nombre,
        activo: true,
      });

      setItems((current) => [...current, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      onChange([...value, created.id]);
      setNewItemName('');
    } catch (error: any) {
      console.error(`Error creating catalog item in ${collectionName}:`, error);
      setError(error?.response?.message || 'No se pudo crear la etiqueta.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleValue(item.id)}
              className="px-3 py-1 rounded-full bg-[var(--color-primary-container)] text-[var(--color-surface-container)] text-sm font-medium"
              title="Quitar técnica"
            >
              {item.nombre} x
            </button>
          ))}
        </div>
      )}

      {canCreateItems && (
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="input-field w-full"
            placeholder="Crear nueva técnica"
          />
          <button
            type="button"
            onClick={handleCreate}
            className="btn-secondary px-4 py-2 text-sm whitespace-nowrap"
            disabled={isCreating || !newItemName.trim()}
          >
            {isCreating ? 'Creando...' : 'Añadir técnica'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-outline)] rounded-md max-h-48 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <p className="text-sm text-[var(--color-on-surface-variant)]">Cargando opciones...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--color-on-surface-variant)]">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <label key={item.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value.includes(item.id)}
                onChange={() => toggleValue(item.id)}
                className="h-4 w-4 text-[var(--color-primary)] rounded border-[var(--color-outline)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-on-surface)]">{item.nombre}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
