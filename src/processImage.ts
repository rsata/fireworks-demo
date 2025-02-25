import fetch from 'node-fetch'
import fs from 'fs'

export const encodeImageToBase64 = (imagePath: string) => {
  const bitmap = fs.readFileSync(imagePath);
  return Buffer.from(bitmap).toString('base64');
}

export const fetchImageToBase64 = async (imageUrl: string) => {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const base64 = buffer.toString('base64');
    return base64;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    return null
  }
}