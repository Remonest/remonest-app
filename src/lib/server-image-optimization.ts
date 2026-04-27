import sharp from 'sharp';

/**
 * Optimizes an image buffer if it's an image.
 * Returns the optimized buffer and the new content type (image/webp).
 */
export async function optimizeImageBuffer(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; mimeType: string }> {
  // Only process images
  if (!mimeType.startsWith('image/')) {
    return { buffer, mimeType };
  }

  // Convert to WebP and resize (max 1200px width/height)
  const optimizedBuffer = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  return {
    buffer: optimizedBuffer,
    mimeType: 'image/webp'
  };
}
