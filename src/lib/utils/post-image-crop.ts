export interface CropAreaPixels {
  width: number;
  height: number;
  x: number;
  y: number;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);
    image.src = source;
  });
}

export async function getCroppedImageFile(
  imageSource: string,
  crop: CropAreaPixels,
  fileName: string,
  type = "image/jpeg",
) {
  const image = await loadImage(imageSource);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare image crop");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92),
  );

  if (!blob) {
    throw new Error("Could not create cropped image");
  }

  return new File([blob], fileName, {
    type,
    lastModified: Date.now(),
  });
}
