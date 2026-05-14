export const MAX_GALLERY_IMAGES = 5;

export function appendCreateMediaFiles(
  formData: FormData,
  coverFile: File | null,
  galleryFiles: FileList | null,
) {
  if (coverFile) formData.append('foto_portada', coverFile);
  appendFiles(formData, 'galeria_fotos', galleryFiles);
}

export function appendGalleryFileUpdates(
  formData: FormData,
  galleryFiles: FileList | null,
  mode: 'create' | 'append' = 'append',
) {
  appendFiles(formData, mode === 'append' ? 'galeria_fotos+' : 'galeria_fotos', galleryFiles);
}

export function appendFileRemovals(formData: FormData, fieldName: string, filenames: string[]) {
  filenames.forEach((filename) => {
    formData.append(`${fieldName}-`, filename);
  });
}

export async function appendRemoteFile(formData: FormData, fieldName: string, url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo leer la imagen existente ${filename}.`);
  }
  const blob = await response.blob();
  formData.append(fieldName, new File([blob], filename, { type: blob.type || 'application/octet-stream' }));
}

function appendFiles(formData: FormData, fieldName: string, files: FileList | null) {
  if (!files) return;
  for (let i = 0; i < files.length; i++) {
    formData.append(fieldName, files[i]);
  }
}
