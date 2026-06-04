import type { EntityGalleryFocus, EntityImageFocus } from './entityMedia';
import { DEFAULT_IMAGE_FOCUS, DEFAULT_IMAGE_ZOOM, normalizeImageFocus, normalizeImageZoom } from './entityMedia';
import { optimizeImageUpload, optimizeImageUploadList } from './imageOptimization';

export const MAX_GALLERY_IMAGES = 5;

export async function appendCreateMediaFiles(
  formData: FormData,
  coverFile: File | null,
  galleryFiles: FileList | null,
) {
  if (coverFile) formData.append('foto_portada', await optimizeImageUpload(coverFile));
  await appendFiles(formData, 'galeria_fotos', galleryFiles);
}

export async function appendGalleryFileUpdates(
  formData: FormData,
  galleryFiles: FileList | null,
  mode: 'create' | 'append' = 'append',
) {
  await appendFiles(formData, mode === 'append' ? 'galeria_fotos+' : 'galeria_fotos', galleryFiles);
}

export async function appendOptimizedImageFile(formData: FormData, fieldName: string, file: File) {
  formData.append(fieldName, await optimizeImageUpload(file));
}

export function appendFileRemovals(formData: FormData, fieldName: string, filenames: string[]) {
  filenames.forEach((filename) => {
    formData.append(`${fieldName}-`, filename);
  });
}

export function appendImageFocusFields(
  formData: FormData,
  coverFocus: EntityImageFocus = DEFAULT_IMAGE_FOCUS,
  galleryFocuses: EntityGalleryFocus = {},
  coverZoom: number = DEFAULT_IMAGE_ZOOM,
) {
  const normalizedCoverFocus = normalizeImageFocus(coverFocus);
  formData.append('foto_portada_focus_x', String(normalizedCoverFocus.x));
  formData.append('foto_portada_focus_y', String(normalizedCoverFocus.y));
  formData.append('foto_portada_zoom', String(normalizeImageZoom(coverZoom)));
  formData.append('galeria_fotos_focus', JSON.stringify(galleryFocuses));
}

export async function appendRemoteFile(formData: FormData, fieldName: string, url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo leer la imagen existente ${filename}.`);
  }
  const blob = await response.blob();
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  formData.append(fieldName, await optimizeImageUpload(file));
}

async function appendFiles(formData: FormData, fieldName: string, files: FileList | null) {
  const optimizedFiles = await optimizeImageUploadList(files);
  for (const file of optimizedFiles) {
    formData.append(fieldName, file);
  }
}
