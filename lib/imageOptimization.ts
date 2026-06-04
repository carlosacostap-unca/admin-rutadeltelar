export const IMAGE_UPLOAD_MAX_DIMENSION = 1920;
export const IMAGE_UPLOAD_MAX_BYTES = 2.5 * 1024 * 1024;
export const IMAGE_UPLOAD_TARGET_MIME = 'image/webp';

const OPTIMIZABLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const QUALITY_STEPS = [0.82, 0.76, 0.7, 0.64, 0.58];
const RESIZE_STEPS = [1, 0.85, 0.72, 0.6, 0.5];

type ImageSize = {
  width: number;
  height: number;
};

type DrawableImage = ImageBitmap | HTMLImageElement;

export async function optimizeImageUpload(file: File): Promise<File> {
  if (!OPTIMIZABLE_IMAGE_TYPES.has(file.type)) {
    ensureUploadSize(file);
    return file;
  }
  if (typeof document === 'undefined') {
    ensureUploadSize(file);
    return file;
  }

  const image = await loadImage(file);
  const sourceSize = getImageSize(image);
  const targetSize = getTargetSize(sourceSize, IMAGE_UPLOAD_MAX_DIMENSION);
  const shouldResize = targetSize.width !== sourceSize.width || targetSize.height !== sourceSize.height;

  if (!shouldResize && file.size <= IMAGE_UPLOAD_MAX_BYTES) {
    closeImage(image);
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetSize.width;
  canvas.height = targetSize.height;

  const context = canvas.getContext('2d');
  if (!context) {
    closeImage(image);
    return file;
  }

  context.drawImage(image, 0, 0, targetSize.width, targetSize.height);
  closeImage(image);

  const bestBlob = await findBestCompressedBlob(canvas, targetSize);

  if (!bestBlob) {
    ensureUploadSize(file);
    return file;
  }

  if (bestBlob.size >= file.size && file.size <= IMAGE_UPLOAD_MAX_BYTES) return file;

  if (bestBlob.size > IMAGE_UPLOAD_MAX_BYTES) {
    throw new Error(
      `La imagen "${file.name}" sigue pesando ${formatBytes(bestBlob.size)} despues de optimizarse. Proba con una imagen mas liviana.`
    );
  }

  return new File([bestBlob], withImageExtension(file.name, getExtensionForMimeType(bestBlob.type)), {
    type: bestBlob.type || IMAGE_UPLOAD_TARGET_MIME,
    lastModified: Date.now(),
  });
}

export async function optimizeImageUploadList(files: FileList | null): Promise<File[]> {
  if (!files) return [];
  return Promise.all(Array.from(files).map((file) => optimizeImageUpload(file)));
}

function getTargetSize(size: ImageSize, maxDimension: number): ImageSize {
  const longestSide = Math.max(size.width, size.height);
  if (longestSide <= maxDimension) return size;

  const scale = maxDimension / longestSide;
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

async function loadImage(file: File): Promise<DrawableImage> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      return loadImageElement(file);
    }
  }

  return loadImageElement(file);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se pudo optimizar la imagen ${file.name}.`));
    };
    image.src = url;
  });
}

function getImageSize(image: DrawableImage): ImageSize {
  if ('naturalWidth' in image) {
    return { width: image.naturalWidth, height: image.naturalHeight };
  }

  return { width: image.width, height: image.height };
}

function closeImage(image: DrawableImage) {
  if ('close' in image) image.close();
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function findBestCompressedBlob(canvas: HTMLCanvasElement, initialSize: ImageSize) {
  let bestBlob: Blob | null = null;

  for (const resizeStep of RESIZE_STEPS) {
    const resizedCanvas = resizeCanvas(canvas, {
      width: Math.max(1, Math.round(initialSize.width * resizeStep)),
      height: Math.max(1, Math.round(initialSize.height * resizeStep)),
    });

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(resizedCanvas, IMAGE_UPLOAD_TARGET_MIME, quality);
      if (!blob) continue;
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= IMAGE_UPLOAD_MAX_BYTES) return blob;
    }
  }

  return bestBlob;
}

function resizeCanvas(source: HTMLCanvasElement, size: ImageSize) {
  if (source.width === size.width && source.height === size.height) return source;

  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.drawImage(source, 0, 0, size.width, size.height);
  return canvas;
}

function ensureUploadSize(file: File) {
  if (file.size <= IMAGE_UPLOAD_MAX_BYTES) return;
  throw new Error(
    `La imagen "${file.name}" pesa ${formatBytes(file.size)} y no se puede optimizar automaticamente. Proba con JPG, PNG o WebP.`
  );
}

function withImageExtension(filename: string, extension: string) {
  const cleanedExtension = extension.replace(/^\./, '');
  const dotIndex = filename.lastIndexOf('.');
  const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
  return `${base}.${cleanedExtension}`;
}

function getExtensionForMimeType(mimeType: string) {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/jpeg') return 'jpg';
  return 'webp';
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
