export const DEFAULT_JIKOSHOUKAI_VIDEO =
  'https://youtu.be/AzbMgEvXFF8?si=kkUKAEOCtsmMBs5T';

export function isImageFotoPath(foto: string | null | undefined): boolean {
  if (!foto) return false;
  if (foto.startsWith('http://') || foto.startsWith('https://') || foto.startsWith('static/')) {
    return true;
  }
  return /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(foto);
}

export function resolveStudentAvatar(
  foto: string | null | undefined,
  baseUrl = '',
): { emoji: string; imageUrl: string | null } {
  if (!foto) return { emoji: '👤', imageUrl: null };
  if (isImageFotoPath(foto)) {
    const imageUrl = foto.startsWith('http')
      ? foto
      : foto.startsWith('static/')
        ? `${baseUrl}/${foto}`
        : `${baseUrl}/static/foto/${foto}`;
    return { emoji: '👤', imageUrl };
  }
  return { emoji: foto, imageUrl: null };
}

export function getYoutubeEmbedUrl(url: string | null | undefined): string {
  const target = url?.trim() || DEFAULT_JIKOSHOUKAI_VIDEO;
  const match = target.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/,
  );
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
}
