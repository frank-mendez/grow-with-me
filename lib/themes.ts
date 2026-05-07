export type ThemeId = 'botanical' | 'blossom' | 'midnight' | 'light'

export interface ThemePreview {
  id: ThemeId
  name: string
  emoji: string
  bg: string
  card: string
  accent: string
  text: string
  borderColor: string
}

export const themes: ThemePreview[] = [
  {
    id: 'botanical',
    name: 'Botanical Calm',
    emoji: '🌿',
    bg: '#0F2A1D',
    card: '#183826',
    accent: '#E7C98B',
    text: '#F5F5F5',
    borderColor: 'rgba(231, 201, 139, 0.18)',
  },
  {
    id: 'blossom',
    name: 'Soft Blossom',
    emoji: '🌸',
    bg: '#2D1B25',
    card: '#3D2535',
    accent: '#E8B4C0',
    text: '#FFE8EE',
    borderColor: 'rgba(232, 180, 192, 0.18)',
  },
  {
    id: 'midnight',
    name: 'Midnight Glow',
    emoji: '🌙',
    bg: '#0D1B30',
    card: '#152440',
    accent: '#B8A8DC',
    text: '#DCD8F0',
    borderColor: 'rgba(176, 160, 220, 0.18)',
  },
  {
    id: 'light',
    name: 'Minimal Light',
    emoji: '☁️',
    bg: '#F8F4EE',
    card: '#FFFFFF',
    accent: '#8B7355',
    text: '#2A1F14',
    borderColor: 'rgba(139, 115, 85, 0.14)',
  },
]

export const DEFAULT_THEME: ThemeId = 'botanical'
