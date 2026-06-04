'use client';

import { asPocketBaseError } from '@/lib/pocketbaseErrors';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/pocketbase';
import { hasAnyRole } from '@/lib/permissions';
import { CATALOGOS_CONFIG, CatalogoCollectionName, CatalogoItem } from '@/types/catalogo';
import { buildCatalogoSort } from '@/lib/catalogos';
import { optimizeImageUpload } from '@/lib/imageOptimization';
import { getPocketBaseImageUrl } from '@/lib/mediaUrls';

type CatalogoDraft = { nombre: string; categoria_padre?: string; foto_portada?: File | null };
type DraftsState = Record<CatalogoCollectionName, CatalogoDraft>;
type ItemsState = Record<CatalogoCollectionName, CatalogoItem[]>;

const emptyDrafts = CATALOGOS_CONFIG.reduce((acc, config) => {
  acc[config.collectionName] = { nombre: '', categoria_padre: '', foto_portada: null };
  return acc;
}, {} as DraftsState);

const emptyItems = CATALOGOS_CONFIG.reduce((acc, config) => {
  acc[config.collectionName] = [];
  return acc;
}, {} as ItemsState);

const getPocketBaseErrorMessage = (err: unknown, fallback: string) => {
  const validationErrors = asPocketBaseError(err)?.response?.data;
  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return `Error de validación: ${Object.entries(validationErrors)
      .map(([field, details]: [string, { message?: string }]) => `${field}: ${details?.message || 'Error'}`)
      .join(' | ')}`;
  }

  return asPocketBaseError(err)?.response?.message || fallback;
};

const getCatalogoCoverUrl = (item: CatalogoItem) =>
  item.foto_portada ? getPocketBaseImageUrl(item, item.foto_portada, 'thumbnail') : '';

export default function ParametrizacionesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [itemsByCollection, setItemsByCollection] = useState<ItemsState>(emptyItems);
  const [drafts, setDrafts] = useState<DraftsState>(emptyDrafts);
  const [loadingData, setLoadingData] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const categoriasProducto = itemsByCollection.categorias_producto || [];

  useEffect(() => {
    if (!isLoading && !hasAnyRole(user, ['admin'])) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          CATALOGOS_CONFIG.map(async (config) => {
            const records = await pb.collection(config.collectionName).getFullList<CatalogoItem>({
              sort: buildCatalogoSort(),
              requestKey: null,
            });
            return [config.collectionName, records] as const;
          })
        );

        setItemsByCollection(
          results.reduce((acc, [collectionName, records]) => {
            acc[collectionName] = records;
            return acc;
          }, { ...emptyItems })
        );
      } catch (err) {
        console.error('Error fetching parameter collections:', err);
        setError('No se pudieron cargar las parametrizaciones.');
      } finally {
        setLoadingData(false);
      }
    };

    if (user && hasAnyRole(user, ['admin'])) {
      fetchAll();
    }
  }, [user]);

  const sections = useMemo(
    () =>
      CATALOGOS_CONFIG.map((config) => ({
        ...config,
        items: itemsByCollection[config.collectionName] || [],
        draft: drafts[config.collectionName],
      })),
    [itemsByCollection, drafts]
  );

  const handleDraftChange = (
    collectionName: CatalogoCollectionName,
    field: 'nombre' | 'categoria_padre',
    value: string
  ) => {
    setDrafts((current) => {
      const next = { ...current };
      next[collectionName] = { ...next[collectionName], [field]: value };
      return next;
    });
  };

  const handleDraftCoverChange = (collectionName: CatalogoCollectionName, file: File | null) => {
    setDrafts((current) => {
      const next = { ...current };
      next[collectionName] = { ...next[collectionName], foto_portada: file };
      return next;
    });
  };

  const handleCreate = async (collectionName: CatalogoCollectionName) => {
    const draft = drafts[collectionName];
    if (!draft.nombre.trim()) return;

    setSavingKey(`create:${collectionName}`);
    setError(null);
    try {
      let payload: Record<string, string | boolean> | FormData = {
          nombre: draft.nombre.trim(),
          activo: true,
        };

      if (collectionName === 'departamentos' && draft.foto_portada) {
        const formData = new FormData();
        formData.append('nombre', draft.nombre.trim());
        formData.append('activo', 'true');
        formData.append('foto_portada', await optimizeImageUpload(draft.foto_portada));
        payload = formData;
      } else if (collectionName === 'subcategorias_producto') {
        payload = {
          ...payload,
          categoria_padre: draft.categoria_padre || '',
        };
      }
      const created = await pb.collection(collectionName).create<CatalogoItem>(payload);

      setItemsByCollection((current) => ({
        ...current,
        [collectionName]: [...current[collectionName], created].sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }));
      setDrafts((current) => ({
        ...current,
        [collectionName]: { nombre: '', categoria_padre: '', foto_portada: null },
      }));
    } catch (err: unknown) {
      console.error('Error creating catalog item:', err);
      setError(getPocketBaseErrorMessage(err, 'No se pudo crear el parámetro.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleCoverUpload = async (
    collectionName: CatalogoCollectionName,
    item: CatalogoItem,
    file: File
  ) => {
    if (collectionName !== 'departamentos') return;

    setSavingKey(`cover:${collectionName}:${item.id}`);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('foto_portada', await optimizeImageUpload(file));

      const updated = await pb.collection(collectionName).update<CatalogoItem>(item.id, formData);

      setItemsByCollection((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((existing) =>
          existing.id === item.id ? updated : existing
        ),
      }));
    } catch (err: unknown) {
      console.error('Error uploading department cover:', err);
      setError(getPocketBaseErrorMessage(err, 'No se pudo subir la portada del departamento.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleCoverDelete = async (collectionName: CatalogoCollectionName, item: CatalogoItem) => {
    if (collectionName !== 'departamentos') return;

    setSavingKey(`cover-delete:${collectionName}:${item.id}`);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('foto_portada', '');

      const updated = await pb.collection(collectionName).update<CatalogoItem>(item.id, formData);

      setItemsByCollection((current) => ({
        ...current,
        [collectionName]: current[collectionName].map((existing) =>
          existing.id === item.id ? updated : existing
        ),
      }));
    } catch (err: unknown) {
      console.error('Error deleting department cover:', err);
      setError(getPocketBaseErrorMessage(err, 'No se pudo quitar la portada del departamento.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleUpdate = async (collectionName: CatalogoCollectionName, item: CatalogoItem) => {
    setSavingKey(`update:${collectionName}:${item.id}`);
    setError(null);
    try {
      const payload: Record<string, string | boolean> = {
        nombre: item.nombre.trim(),
        activo: item.activo ?? true,
      };
      if (collectionName === 'subcategorias_producto') {
        payload.categoria_padre = item.categoria_padre || '';
      }
      const updated = await pb.collection(collectionName).update<CatalogoItem>(item.id, payload);

      setItemsByCollection((current) => ({
        ...current,
        [collectionName]: current[collectionName]
          .map((existing) => (existing.id === item.id ? updated : existing))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }));
    } catch (err: unknown) {
      console.error('Error updating catalog item:', err);
      setError(getPocketBaseErrorMessage(err, 'No se pudo actualizar el parámetro.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleDelete = async (collectionName: CatalogoCollectionName, itemId: string) => {
    setSavingKey(`delete:${collectionName}:${itemId}`);
    setError(null);
    try {
      await pb.collection(collectionName).delete(itemId);
      setItemsByCollection((current) => ({
        ...current,
        [collectionName]: current[collectionName].filter((item) => item.id !== itemId),
      }));
    } catch (err: unknown) {
      console.error('Error deleting catalog item:', err);
      setError(getPocketBaseErrorMessage(err, 'No se pudo eliminar el parámetro.'));
    } finally {
      setSavingKey(null);
    }
  };

  const handleItemChange = (
    collectionName: CatalogoCollectionName,
    itemId: string,
    field: keyof CatalogoItem,
    value: string | boolean
  ) => {
    setItemsByCollection((current) => ({
      ...current,
      [collectionName]: current[collectionName].map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, [field]: value };
      }),
    }));
  };

  if (isLoading || !user || loadingData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.02em] font-display text-[var(--color-primary)]">
              Parametrizaciones
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
              Gestiona los valores que alimentan los campos relation de tipo catálogo.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-[var(--color-error-container)] text-[var(--color-on-error-container)] text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {sections.map((section) => (
            <section
              key={section.collectionName}
              className="bg-[var(--color-surface-container)] rounded-[8px] p-6 space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-[var(--color-primary)]">{section.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <input
                  type="text"
                  value={section.draft.nombre}
                  onChange={(e) => handleDraftChange(section.collectionName, 'nombre', e.target.value)}
                  className="input-field w-full"
                  placeholder="Nombre"
                />
                {section.collectionName === 'subcategorias_producto' && (
                  <select
                    value={section.draft.categoria_padre || ''}
                    onChange={(e) => handleDraftChange(section.collectionName, 'categoria_padre', e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Seleccionar categoría padre...</option>
                    {categoriasProducto.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                )}
                {section.collectionName === 'departamentos' && (
                  <label className="block">
                    <span className="sr-only">Portada del departamento</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-xs text-[var(--color-on-surface-variant)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--color-on-primary)]"
                      onChange={(e) => handleDraftCoverChange(section.collectionName, e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => handleCreate(section.collectionName)}
                  className="btn-primary px-4 py-2 text-sm"
                  disabled={savingKey === `create:${section.collectionName}`}
                >
                  Añadir
                </button>
              </div>

              <div className="space-y-3">
                {section.items.length === 0 ? (
                  <p className="text-sm text-[var(--color-on-surface-variant)]">Sin registros todavía.</p>
                ) : (
                  section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 ${section.collectionName === 'subcategorias_producto' ? 'md:grid-cols-[1fr_1fr_100px_auto_auto]' : section.collectionName === 'departamentos' ? 'md:grid-cols-[1fr_1.5fr_100px_auto_auto]' : 'md:grid-cols-[1fr_100px_auto_auto]'} gap-3 items-center border border-[var(--color-outline-variant)] rounded-md p-3`}
                    >
                      <input
                        type="text"
                        value={item.nombre}
                        onChange={(e) => handleItemChange(section.collectionName, item.id, 'nombre', e.target.value)}
                        className="input-field w-full"
                      />
                      {section.collectionName === 'departamentos' && (
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-variant)]">
                            {item.foto_portada ? (
                              <Image
                                unoptimized
                                width={320}
                                height={180}
                                src={getCatalogoCoverUrl(item)}
                                alt={`Portada de ${item.nombre}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--color-on-surface-variant)]">
                                Sin portada
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <label className="block">
                              <span className="sr-only">Subir portada de {item.nombre}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="block w-full text-xs text-[var(--color-on-surface-variant)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-primary)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--color-on-primary)]"
                                disabled={savingKey === `cover:${section.collectionName}:${item.id}`}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  e.currentTarget.value = '';
                                  if (file) handleCoverUpload(section.collectionName, item, file);
                                }}
                              />
                            </label>
                            {item.foto_portada && (
                              <button
                                type="button"
                                onClick={() => handleCoverDelete(section.collectionName, item)}
                                className="text-xs font-semibold text-red-600 hover:underline"
                                disabled={savingKey === `cover-delete:${section.collectionName}:${item.id}`}
                              >
                                Quitar portada
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      {section.collectionName === 'subcategorias_producto' && (
                        <select
                          value={item.categoria_padre || ''}
                          onChange={(e) => handleItemChange(section.collectionName, item.id, 'categoria_padre', e.target.value)}
                          className="input-field w-full"
                        >
                          <option value="">Seleccionar categoría padre...</option>
                          {categoriasProducto.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                      )}
                      <label className="flex items-center gap-2 text-sm text-[var(--color-on-surface)]">
                        <input
                          type="checkbox"
                          checked={item.activo ?? true}
                          onChange={(e) => handleItemChange(section.collectionName, item.id, 'activo', e.target.checked)}
                        />
                        Activo
                      </label>
                      <button
                        type="button"
                        onClick={() => handleUpdate(section.collectionName, item)}
                        className="btn-secondary px-4 py-2 text-sm"
                        disabled={savingKey === `update:${section.collectionName}:${item.id}`}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(section.collectionName, item.id)}
                        className="px-4 py-2 text-sm rounded-md border border-red-500 text-red-600 hover:bg-red-50"
                        disabled={savingKey === `delete:${section.collectionName}:${item.id}`}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
