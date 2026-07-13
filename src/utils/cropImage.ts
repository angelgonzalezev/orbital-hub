import type { Area } from 'react-easy-crop';

const OUTPUT_SIZE = 512;
const OUTPUT_QUALITY = 0.85;

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to read the selected image.'));
    image.src = source;
  });

export const createCroppedImage = async (source: string, crop: Area): Promise<Blob> => {
  const image = await loadImage(source);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Image processing is not available in this browser.');

  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', OUTPUT_QUALITY));
  if (!blob) throw new Error('Unable to process the selected image.');
  return blob;
};
