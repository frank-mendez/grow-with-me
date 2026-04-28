export type Mood = 'HAPPY' | 'NEUTRAL' | 'STRESSED' | 'SAD'

export interface PregnancyWeek {
  id: string
  week_number: number
  title: string | null
  description: string | null
}

export interface VoiceEntry {
  id: string
  user_id: string
  week_id: string
  audio_url: string
  created_at: string
}

export interface KickLog {
  id: string
  user_id: string
  date: string
  count: number
}

export interface MoodEntry {
  id: string
  user_id: string
  date: string
  mood: Mood
}

export interface Profile {
  id: string
  display_name: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}
