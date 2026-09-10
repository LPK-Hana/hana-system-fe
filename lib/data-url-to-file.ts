/** Ubah data URL (base64) dari preview form menjadi File untuk upload. */
export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const ext = blob.type?.split('/')[1] || 'jpg';
  const safeName = filename.includes('.') ? filename : `${filename}.${ext}`;
  return new File([blob], safeName, { type: blob.type || 'image/jpeg' });
}

export function isDataUrlImage(value: string | null | undefined): value is string {
  return Boolean(value?.startsWith('data:image'));
}
