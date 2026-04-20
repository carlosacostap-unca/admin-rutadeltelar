'use client';

import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbase';
import { buildCatalogoSort } from '@/lib/catalogos';
import { CatalogoCollectionName, CatalogoItem } from '@/types/catalogo';

interface CatalogSelectProps {
  collectionName: CatalogoCollectionName;
  value: string;
  onChange: (value: string) => void;
  emptyLabel: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  includeInactive?: boolean;
}

export default function CatalogSelect({
  collectionName,
  value,
  onChange,
  emptyLabel,
  className = 'input-field w-full',
  required = false,
  disabled = false,
  includeInactive = false,
}: CatalogSelectProps) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      try {
        const records = await pb.collection(collectionName).getFullList<CatalogoItem>({
          filter: includeInactive ? '' : 'activo = true',
          sort: buildCatalogoSort(),
          requestKey: null,
        });

        if (!cancelled) {
          setItems(records);
        }
      } catch (error) {
        console.error(`Error fetching catalog items from ${collectionName}:`, error);
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
  }, [collectionName, includeInactive]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      required={required}
      disabled={disabled || loading}
    >
      <option value="">{loading ? 'Cargando...' : emptyLabel}</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.nombre}
        </option>
      ))}
    </select>
  );
}
