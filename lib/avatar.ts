const EMOJI_AVATAR_RE = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation})(\uFE0F|\u200D(\p{Extended_Pictographic}|\p{Emoji_Presentation})\uFE0F?)*$/u;

export function isEmojiAvatar(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  const t = value.trim();
  if (t.includes('/') || t.startsWith('http') || t.startsWith('data:')) return false;
  return EMOJI_AVATAR_RE.test(t) || (t.length <= 4 && !/\.(jpg|jpeg|png|webp|gif)$/i.test(t));
}

export function resolveStudentAvatar(
  foto: string | null | undefined,
  fallbackEmoji = '👤',
): string {
  if (!foto?.trim()) return fallbackEmoji;
  if (isEmojiAvatar(foto)) return foto.trim();
  return foto;
}
