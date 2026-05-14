'use client';

import Image from 'next/image';
import pb from '@/lib/pocketbase';
import { EntityMediaRecord, getEntityCoverImage, getEntityGalleryImages } from '@/lib/entityMedia';

type EntityMediaDisplayProps<T extends EntityMediaRecord> = {
  record: T;
  title: string;
  emptyLabel: string;
};

export default function EntityMediaDisplay<T extends EntityMediaRecord>({
  record,
  title,
  emptyLabel,
}: EntityMediaDisplayProps<T>) {
  const cover = getEntityCoverImage(record);
  const gallery = getEntityGalleryImages(record);

  return (
    <div className="mt-8 pt-6 border-t border-[var(--color-outline-variant)] space-y-8">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
          Foto de portada
        </h3>
        {cover ? (
          <div className="max-w-sm">
            <div className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
              <Image unoptimized width={800} height={600} src={pb.files.getURL(record, cover)} alt={`Portada de ${title}`} className="object-contain w-full h-full p-1" />
            </div>
          </div>
        ) : (
          <p className="text-[var(--color-on-surface-variant)] italic">{emptyLabel}</p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--color-on-surface)] mb-4 uppercase tracking-[0.05em]">
          Galeria de fotos
        </h3>
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((filename, index) => (
              <div key={filename} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                <Image unoptimized width={800} height={600} src={pb.files.getURL(record, filename)} alt={`Foto de galeria ${index + 1} de ${title}`} className="object-contain w-full h-full p-1" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-on-surface-variant)] italic">
            No hay fotos en la galeria.
          </p>
        )}
      </div>
    </div>
  );
}
