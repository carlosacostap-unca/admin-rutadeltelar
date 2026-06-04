'use client';

import Image from 'next/image';
import { EntityMediaRecord, getEntityCoverFocus, getEntityCoverImageRef, getEntityCoverZoom, getImageCropStyle } from '@/lib/entityMedia';
import { getPocketBaseImageUrl } from '@/lib/mediaUrls';

type EntityCoverThumbnailProps<T extends EntityMediaRecord> = {
  record: T;
  title: string;
};

export default function EntityCoverThumbnail<T extends EntityMediaRecord>({ record, title }: EntityCoverThumbnailProps<T>) {
  const cover = getEntityCoverImageRef(record);
  const focus = getEntityCoverFocus(record);
  const zoom = getEntityCoverZoom(record);

  return (
    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--color-outline-variant)] bg-[var(--color-surface)]">
      {cover ? (
        <Image unoptimized width={320} height={320} src={getPocketBaseImageUrl(record, cover.displayFilename, 'thumbnail')} alt={`Portada de ${title}`} className="h-full w-full object-cover" style={getImageCropStyle(focus, zoom)} />
      ) : (
        <div className="h-full w-full bg-[var(--color-surface-variant)]" />
      )}
    </div>
  );
}
