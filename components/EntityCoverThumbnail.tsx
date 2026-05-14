'use client';

import Image from 'next/image';
import pb from '@/lib/pocketbase';
import { EntityMediaRecord, getEntityCoverImage } from '@/lib/entityMedia';

type EntityCoverThumbnailProps<T extends EntityMediaRecord> = {
  record: T;
  title: string;
};

export default function EntityCoverThumbnail<T extends EntityMediaRecord>({ record, title }: EntityCoverThumbnailProps<T>) {
  const cover = getEntityCoverImage(record);

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)]">
      {cover ? (
        <Image unoptimized width={320} height={320} src={pb.files.getURL(record, cover)} alt={`Portada de ${title}`} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-[var(--color-surface-variant)]" />
      )}
    </div>
  );
}
