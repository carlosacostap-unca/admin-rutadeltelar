type MediaSubmitFeedbackProps = {
  isSubmitting: boolean;
  hasPendingImages: boolean;
};

export function hasPendingImageUploads(coverFile: File | null, galleryFiles: FileList | null) {
  return Boolean(coverFile || (galleryFiles && galleryFiles.length > 0));
}

export function getMediaSubmitButtonLabel(isSubmitting: boolean, hasPendingImages: boolean, idleLabel: string) {
  if (!isSubmitting) return idleLabel;
  return hasPendingImages ? 'Optimizando imagenes...' : 'Guardando...';
}

export function MediaSubmitFeedback({ isSubmitting, hasPendingImages }: MediaSubmitFeedbackProps) {
  if (!isSubmitting) return null;

  return (
    <p className="text-sm text-[var(--color-on-surface-variant)]" role="status" aria-live="polite">
      {hasPendingImages
        ? 'Optimizando imagenes y guardando cambios...'
        : 'Guardando cambios...'}
    </p>
  );
}
