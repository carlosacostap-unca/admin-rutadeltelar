'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import pb from '@/lib/pocketbase';
import { useAuth } from '@/contexts/AuthContext';

type EntityType = 'estaciones' | 'actores' | 'productos' | 'experiencias' | 'imperdibles';

type MetricViewRecord = {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  entity_slug: string;
  entity_title: string;
  viewed_at?: string;
  viewed_on: string;
  is_unique_daily?: boolean;
};

type EntitySummary = {
  key: string;
  entityType: EntityType;
  entityId: string;
  entityTitle: string;
  views: number;
  uniqueDaily: number;
};

const ENTITY_LABELS: Record<EntityType, string> = {
  estaciones: 'Estaciones',
  actores: 'Actores',
  productos: 'Productos',
  experiencias: 'Experiencias',
  imperdibles: 'Imperdibles',
};

const ENTITY_OPTIONS: Array<{ value: EntityType | 'todos'; label: string }> = [
  { value: 'todos', label: 'Todas' },
  { value: 'estaciones', label: 'Estaciones' },
  { value: 'actores', label: 'Actores' },
  { value: 'productos', label: 'Productos' },
  { value: 'experiencias', label: 'Experiencias' },
  { value: 'imperdibles', label: 'Imperdibles' },
];

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return formatDateInput(date);
}

function getTodayDate() {
  return formatDateInput(new Date());
}

function isEntityType(value: string): value is EntityType {
  return Object.prototype.hasOwnProperty.call(ENTITY_LABELS, value);
}

export default function MetricsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<MetricViewRecord[]>([]);
  const [startDate, setStartDate] = useState(getDefaultStartDate);
  const [endDate, setEndDate] = useState(getTodayDate);
  const [entityType, setEntityType] = useState<EntityType | 'todos'>('todos');
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      setIsLoadingMetrics(true);
      setError(null);

      try {
        const filters = [`viewed_on >= "${startDate}"`, `viewed_on <= "${endDate}"`];
        if (entityType !== 'todos') {
          filters.push(`entity_type = "${entityType}"`);
        }

        const items = await pb.collection('metricas_visitas').getFullList<MetricViewRecord>({
          filter: filters.join(' && '),
          sort: '-viewed_at',
          requestKey: null,
        });

        setRecords(items.filter((item) => isEntityType(item.entity_type)));
      } catch (err) {
        console.error('Error al cargar metricas:', err);
        setError('No se pudieron cargar las metricas. Verifica que exista la coleccion "metricas_visitas" en PocketBase.');
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [endDate, entityType, startDate, user]);

  const summary = useMemo(() => buildSummary(records), [records]);

  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="animate-pulse text-sm font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-surface-dim)]">
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <section className="mb-8 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface-container)] px-6 py-6 md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">Catalogo publico</p>
              <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-[var(--color-primary)]">
                Metricas de visitas
              </h1>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                Desde
                <input type="date" className="input-field text-sm" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                Hasta
                <input type="date" className="input-field text-sm" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                Tipo
                <select className="input-field text-sm" value={entityType} onChange={(event) => setEntityType(event.target.value as EntityType | 'todos')}>
                  {ENTITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-8 rounded-md bg-[var(--color-error-container)] px-5 py-4 text-sm font-semibold text-[var(--color-on-error-container)]">
            {error}
          </div>
        ) : null}

        <section className="mb-10">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Visitas" value={summary.totalViews} />
            <MetricCard title="Unicos diarios" value={summary.totalUniqueDaily} />
            <MetricCard title="Entidades vistas" value={summary.topEntities.length} />
            <MetricCard title="Hoy" value={summary.todayViews} />
          </div>
        </section>

        {isLoadingMetrics ? (
          <p className="text-sm font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">Calculando metricas...</p>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--color-surface-variant)] pb-2">
                <h2 className="text-sm font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface)]">Ranking de contenidos</h2>
                <span className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">{summary.topEntities.length} items</span>
              </div>

              {summary.topEntities.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-hidden rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)]">
                  <div className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 border-b border-[var(--color-outline-variant)] px-4 py-3 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-primary)]">
                    <span>Contenido</span>
                    <span className="text-right">Visitas</span>
                    <span className="text-right">Unicos</span>
                  </div>
                  {summary.topEntities.map((item) => (
                    <Link key={item.key} href={`/${item.entityType}/${item.entityId}`} className="grid grid-cols-[minmax(0,1fr)_110px_110px] gap-3 border-b border-[var(--color-outline-variant)] px-4 py-4 transition-colors last:border-0 hover:bg-[var(--color-surface-variant)]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[var(--color-primary)]">{item.entityTitle}</span>
                        <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">{ENTITY_LABELS[item.entityType]}</span>
                      </span>
                      <span className="text-right text-lg font-extrabold text-[var(--color-primary)]">{item.views}</span>
                      <span className="text-right text-lg font-extrabold text-[var(--color-primary)]">{item.uniqueDaily}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-8">
              <section>
                <h2 className="mb-4 border-b border-[var(--color-surface-variant)] pb-2 text-sm font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface)]">Por tipo</h2>
                <div className="space-y-3">
                  {summary.byType.map((item) => (
                    <BarRow key={item.entityType} label={ENTITY_LABELS[item.entityType]} value={item.views} max={summary.maxTypeViews} />
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 border-b border-[var(--color-surface-variant)] pb-2 text-sm font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface)]">Evolucion diaria</h2>
                <div className="space-y-2">
                  {summary.dailySeries.map((item) => (
                    <BarRow key={item.date} label={formatShortDate(item.date)} value={item.views} max={summary.maxDailyViews} />
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function buildSummary(records: MetricViewRecord[]) {
  const today = getTodayDate();
  const byEntity = new Map<string, EntitySummary>();
  const typeCounts = new Map<EntityType, number>();
  const dailyCounts = new Map<string, number>();

  for (const record of records) {
    const entityKey = `${record.entity_type}:${record.entity_id}`;
    const current = byEntity.get(entityKey) ?? {
      key: entityKey,
      entityType: record.entity_type,
      entityId: record.entity_id,
      entityTitle: record.entity_title,
      views: 0,
      uniqueDaily: 0,
    };

    current.views += 1;
    if (record.is_unique_daily) current.uniqueDaily += 1;
    byEntity.set(entityKey, current);
    typeCounts.set(record.entity_type, (typeCounts.get(record.entity_type) ?? 0) + 1);
    dailyCounts.set(record.viewed_on, (dailyCounts.get(record.viewed_on) ?? 0) + 1);
  }

  const topEntities = Array.from(byEntity.values()).sort((a, b) => b.views - a.views);
  const byType = (Object.keys(ENTITY_LABELS) as EntityType[]).map((type) => ({
    entityType: type,
    views: typeCounts.get(type) ?? 0,
  }));
  const dailySeries = Array.from(dailyCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));

  return {
    totalViews: records.length,
    totalUniqueDaily: records.filter((record) => record.is_unique_daily).length,
    todayViews: records.filter((record) => record.viewed_on === today).length,
    topEntities,
    byType,
    dailySeries,
    maxTypeViews: Math.max(1, ...byType.map((item) => item.views)),
    maxDailyViews: Math.max(1, ...dailySeries.map((item) => item.views)),
  };
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-md border-t-4 border-[var(--color-primary)] bg-[var(--color-surface-container)] px-6 py-6">
      <p className="text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">{title}</p>
      <p className="mt-3 font-display text-4xl font-extrabold text-[var(--color-primary)]">{value}</p>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = `${Math.max(4, Math.round((value / max) * 100))}%`;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.05em] text-[var(--color-on-surface-variant)]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[var(--color-surface-container)]">
        <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md bg-[var(--color-surface-container)] px-6 py-10 text-center text-sm font-semibold text-[var(--color-on-surface-variant)]">
      No hay visitas registradas para los filtros seleccionados.
    </div>
  );
}

function formatShortDate(value: string) {
  const [, month, day] = value.split('-');
  return `${day}/${month}`;
}
