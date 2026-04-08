import { createAvatar } from '@dicebear/core'
import { adventurer, bottts, avataaars, funEmoji } from '@dicebear/collection'

export type AvatarStyle = 'adventurer' | 'bottts' | 'avataaars' | 'funEmoji'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STYLE_MAP: Record<AvatarStyle, any> = {
  adventurer,
  bottts,
  avataaars,
  funEmoji,
}

export const AVATAR_STYLES: { id: AvatarStyle; labelTr: string; labelEn: string; emoji: string }[] = [
  { id: 'adventurer', labelTr: 'Sevimli', labelEn: 'Cute', emoji: '\u{1F60A}' },
  { id: 'bottts', labelTr: 'Fütüristik', labelEn: 'Futuristic', emoji: '\u{1F916}' },
  { id: 'avataaars', labelTr: 'Modern', labelEn: 'Modern', emoji: '\u{1F464}' },
  { id: 'funEmoji', labelTr: 'Eğlenceli', labelEn: 'Fun', emoji: '\u{1F604}' },
]

export function getAvatarDataUri(
  seed: string,
  style: AvatarStyle = 'adventurer'
): string {
  try {
    const s = STYLE_MAP[style]
    if (!s) return ''
    const avatar = createAvatar(s, {
      seed,
      size: 128,
    })
    return avatar.toDataUri()
  } catch {
    return ''
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
