"use client";

import dynamic from 'next/dynamic';
import { MapProps } from './MapInner';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center rounded-lg border border-[var(--color-outline)]">
      <p className="text-[var(--color-on-surface-variant)]">Cargando mapa...</p>
    </div>
  )
});

export default function Map(props: MapProps) {
  return <MapInner {...props} />;
}
