// This file will be auto-generated from Supabase schema
// For now, we'll use a placeholder type

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          uid: string
          email: string
          display_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          pronouns: string | null
          location: string | null
          timezone: string | null
          custom_status: string | null
          theme_color: string | null
          points: number
          role: string
          roles: string[]
          is_active: boolean
          is_online: boolean
          last_seen: string | null
          join_date: string
          last_login_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          uid: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          pronouns?: string | null
          location?: string | null
          timezone?: string | null
          custom_status?: string | null
          theme_color?: string | null
          points?: number
          role?: string
          roles?: string[]
          is_active?: boolean
          is_online?: boolean
          last_seen?: string | null
          join_date?: string
          last_login_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          uid?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          pronouns?: string | null
          location?: string | null
          timezone?: string | null
          custom_status?: string | null
          theme_color?: string | null
          points?: number
          role?: string
          roles?: string[]
          is_active?: boolean
          is_online?: boolean
          last_seen?: string | null
          join_date?: string
          last_login_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          game: string
          description: string | null
          date: string
          max_participants: number | null
          status: string
          prize_pool: string | null
          rules: string | null
          format: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          game: string
          description?: string | null
          date: string
          max_participants?: number | null
          status?: string
          prize_pool?: string | null
          rules?: string | null
          format?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          game?: string
          description?: string | null
          date?: string
          max_participants?: number | null
          status?: string
          prize_pool?: string | null
          rules?: string | null
          format?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: string
          participant_ids: string[]
          tournament_id: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          participant_ids: string[]
          tournament_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          participant_ids?: string[]
          tournament_id?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          type: string
          attachments: Json | null
          mentions: string[] | null
          reactions: Json | null
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          type?: string
          attachments?: Json | null
          mentions?: string[] | null
          reactions?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          type?: string
          attachments?: Json | null
          mentions?: string[] | null
          reactions?: Json | null
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

