'use client';

import Image from 'next/image';
import { MAX_GALLERY_IMAGES } from '@/lib/entityMediaForm';

export type ExistingMediaImage = {
  filename: string;
  url: string;
  label: string;
};

type EntityMediaUploadProps = {
  entityLabel: string;
  coverFile: File | null;
  onCoverFileChange: (file: File | null) => void;
  galleryFiles: FileList | null;
  onGalleryFilesChange: (files: FileList | null) => void;
  existingCover?: ExistingMediaImage | null;
  existingGallery?: ExistingMediaImage[];
  selectedExistingCover?: string | null;
  onSelectedExistingCoverChange?: (filename: string | null) => void;
  removedExistingCover?: boolean;
  onRemovedExistingCoverChange?: (removed: boolean) => void;
  removedExistingGallery?: string[];
  onToggleRemoveExistingGallery?: (filename: string) => void;
};

export default function EntityMediaUpload({
  entityLabel,
  coverFile,
  onCoverFileChange,
  galleryFiles,
  onGalleryFilesChange,
  existingCover,
  existingGallery = [],
  selectedExistingCover,
  onSelectedExistingCoverChange,
  removedExistingCover = false,
  onRemovedExistingCoverChange,
  removedExistingGallery = [],
  onToggleRemoveExistingGallery,
}: EntityMediaUploadProps) {
  const visibleExistingGallery = existingGallery.filter((item) => !removedExistingGallery.includes(item.filename));
  const galleryCount = visibleExistingGallery.length + (galleryFiles?.length || 0);
  const selectedCover = selectedExistingCover || existingCover?.filename || null;
  const inputId = `gallery-upload-${entityLabel.replace(/\s+/g, '-').toLowerCase()}`;
  const coverInputId = `cover-upload-${entityLabel.replace(/\s+/g, '-').toLowerCase()}`;

  const removeGalleryFile = (index: number) => {
    if (!galleryFiles) return;
    const dt = new DataTransfer();
    Array.from(galleryFiles).forEach((file, currentIndex) => {
      if (currentIndex !== index) dt.items.add(file);
    });
    onGalleryFilesChange(dt.files.length > 0 ? dt.files : null);
  };

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    const dt = new DataTransfer();
    if (galleryFiles) Array.from(galleryFiles).forEach((file) => dt.items.add(file));

    const remainingSlots = MAX_GALLERY_IMAGES - galleryCount;
    Array.from(files).slice(0, remainingSlots).forEach((file) => dt.items.add(file));
    if (files.length > remainingSlots) {
      alert(`Puedes tener un maximo de ${MAX_GALLERY_IMAGES} imagenes en la galeria.`);
    }
    onGalleryFilesChange(dt.files.length > 0 ? dt.files : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
          Foto de portada (opcional)
        </label>
        <div className="flex flex-col gap-4">
          {existingCover && !removedExistingCover && !coverFile && (
            <div className="flex flex-col gap-2">
              <div className="aspect-square w-40 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                <Image unoptimized width={800} height={600} src={existingCover.url} alt={existingCover.label} className="object-contain w-full h-full p-1" />
              </div>
              {onRemovedExistingCoverChange && (
                <button type="button" onClick={() => onRemovedExistingCoverChange(true)} className="btn-secondary px-3 py-1.5 text-xs w-fit">
                  Quitar portada
                </button>
              )}
            </div>
          )}

          {coverFile && (
            <div className="aspect-square w-40 bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)] group">
              <Image unoptimized width={800} height={600} src={URL.createObjectURL(coverFile)} alt={`Nueva portada de ${entityLabel}`} className="object-contain w-full h-full p-1" />
              <button type="button" onClick={() => onCoverFileChange(null)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                x
              </button>
            </div>
          )}

          <div>
            <input
              id={coverInputId}
              type="file"
              accept="image/*"
              onChange={(event) => {
                onCoverFileChange(event.target.files?.[0] || null);
                onRemovedExistingCoverChange?.(false);
                event.target.value = '';
              }}
              className="hidden"
            />
            <label htmlFor={coverInputId} className="btn-secondary inline-flex px-4 py-2 text-sm shadow-sm cursor-pointer">
              {coverFile || existingCover ? 'Cambiar portada' : '+ Anadir portada'}
            </label>
          </div>
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
          La portada se usa en tarjetas, listados y resumenes.
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-[var(--color-on-surface)] mb-2 uppercase tracking-[0.05em]">
          Galeria de fotos (opcional)
        </label>
        <div className="space-y-4">
          {(visibleExistingGallery.length > 0 || (galleryFiles && galleryFiles.length > 0)) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {visibleExistingGallery.map((image) => (
                <div key={image.filename} className="space-y-2">
                  <div className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                    <Image unoptimized width={800} height={600} src={image.url} alt={image.label} className="object-contain w-full h-full p-1" />
                  </div>
                  {onSelectedExistingCoverChange && (
                    <label className="flex items-center gap-2 text-xs text-[var(--color-on-surface)]">
                      <input
                        type="radio"
                        name={`${entityLabel}-cover-choice`}
                        checked={selectedCover === image.filename}
                        onChange={() => onSelectedExistingCoverChange(image.filename)}
                      />
                      Usar como portada
                    </label>
                  )}
                  {onToggleRemoveExistingGallery && (
                    <button type="button" onClick={() => onToggleRemoveExistingGallery(image.filename)} className="btn-secondary px-3 py-1.5 text-xs w-full">
                      Quitar de galeria
                    </button>
                  )}
                </div>
              ))}

              {galleryFiles && Array.from(galleryFiles).map((file, index) => (
                <div key={`${file.name}-${index}`} className="aspect-square bg-[var(--color-surface-container)] rounded-md overflow-hidden relative border border-[var(--color-outline-variant)]">
                  <Image unoptimized width={800} height={600} src={URL.createObjectURL(file)} alt={`Nueva foto de galeria ${index + 1}`} className="object-contain w-full h-full p-1" />
                  <button type="button" onClick={() => removeGalleryFile(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          {galleryCount < MAX_GALLERY_IMAGES && (
            <div>
              <input
                id={inputId}
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  addGalleryFiles(event.target.files);
                  event.target.value = '';
                }}
                className="hidden"
              />
              <label htmlFor={inputId} className="btn-secondary inline-flex px-4 py-2 text-sm shadow-sm cursor-pointer">
                + Anadir foto
              </label>
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
          Puedes seleccionar hasta {MAX_GALLERY_IMAGES} imagenes para la galeria, ademas de la portada.
        </p>
      </div>
    </div>
  );
}
