export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      archived_event_category_assignments: {
        Row: {
          category_id: number
          category_name: string | null
          event_id: number
          sort_order: number
        }
        Insert: {
          category_id: number
          category_name?: string | null
          event_id: number
          sort_order?: number
        }
        Update: {
          category_id?: number
          category_name?: string | null
          event_id?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "archived_event_category_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "archived_events"
            referencedColumns: ["id"]
          },
        ]
      }
      archived_events: {
        Row: {
          address: string | null
          archived_at: string
          category_id: number | null
          created_at: string | null
          created_by: string | null
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          end_time: string | null
          id: number
          image_credit: string | null
          image_edits: string | null
          image_license: string | null
          image_license_url: string | null
          image_source_url: string | null
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          neighborhood_id: number | null
          place_id: number | null
          recurrence_rule: string | null
          recurrence_timezone: string | null
          start_time: string | null
          title: string | null
          venue_name: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          end_time?: string | null
          id: number
          image_credit?: string | null
          image_edits?: string | null
          image_license?: string | null
          image_license_url?: string | null
          image_source_url?: string | null
          image_thumb_url?: string | null
          image_url?: string | null
          location?: unknown
          neighborhood_id?: number | null
          place_id?: number | null
          recurrence_rule?: string | null
          recurrence_timezone?: string | null
          start_time?: string | null
          title?: string | null
          venue_name?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string
          category_id?: number | null
          created_at?: string | null
          created_by?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          end_time?: string | null
          id?: number
          image_credit?: string | null
          image_edits?: string | null
          image_license?: string | null
          image_license_url?: string | null
          image_source_url?: string | null
          image_thumb_url?: string | null
          image_url?: string | null
          location?: unknown
          neighborhood_id?: number | null
          place_id?: number | null
          recurrence_rule?: string | null
          recurrence_timezone?: string | null
          start_time?: string | null
          title?: string | null
          venue_name?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archived_events_dress_code_id_fkey"
            columns: ["dress_code_id"]
            isOneToOne: false
            referencedRelation: "dress_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_in_audience: {
        Row: {
          check_in_id: number
          created_at: string
          user_id: string
        }
        Insert: {
          check_in_id: number
          created_at?: string
          user_id: string
        }
        Update: {
          check_in_id?: number
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_audience_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_audience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_in_comments: {
        Row: {
          body: string
          check_in_id: number
          created_at: string
          id: number
          push_notified_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          check_in_id: number
          created_at?: string
          id?: never
          push_notified_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          check_in_id?: number
          created_at?: string
          id?: never
          push_notified_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_comments_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_in_participants: {
        Row: {
          check_in_id: number
          invited_at: string
          push_notified_at: string | null
          responded_at: string | null
          role: Database["public"]["Enums"]["checkin_role"]
          user_id: string
        }
        Insert: {
          check_in_id: number
          invited_at?: string
          push_notified_at?: string | null
          responded_at?: string | null
          role?: Database["public"]["Enums"]["checkin_role"]
          user_id: string
        }
        Update: {
          check_in_id?: number
          invited_at?: string
          push_notified_at?: string | null
          responded_at?: string | null
          role?: Database["public"]["Enums"]["checkin_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_in_participants_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_in_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          archived_event_id: number | null
          duration_minutes: number | null
          event_id: number | null
          expires_at: string
          id: number
          note: string | null
          place_id: number | null
          push_notified_at: string | null
          started_at: string
          user_id: string
          visibility: Database["public"]["Enums"]["checkin_visibility"]
        }
        Insert: {
          archived_event_id?: number | null
          duration_minutes?: number | null
          event_id?: number | null
          expires_at: string
          id?: never
          note?: string | null
          place_id?: number | null
          push_notified_at?: string | null
          started_at?: string
          user_id: string
          visibility?: Database["public"]["Enums"]["checkin_visibility"]
        }
        Update: {
          archived_event_id?: number | null
          duration_minutes?: number | null
          event_id?: number | null
          expires_at?: string
          id?: never
          note?: string | null
          place_id?: number | null
          push_notified_at?: string | null
          started_at?: string
          user_id?: string
          visibility?: Database["public"]["Enums"]["checkin_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_archived_event_id_fkey"
            columns: ["archived_event_id"]
            isOneToOne: false
            referencedRelation: "archived_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crowd_members: {
        Row: {
          created_at: string
          crowd_id: number
          member_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          crowd_id: number
          member_id: string
          sort_order: number
        }
        Update: {
          created_at?: string
          crowd_id?: number
          member_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "crowd_members_crowd_id_fkey"
            columns: ["crowd_id"]
            isOneToOne: false
            referencedRelation: "crowds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crowd_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crowds: {
        Row: {
          created_at: string
          id: number
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crowds_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dress_codes: {
        Row: {
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      event_category_assignments: {
        Row: {
          category_id: number
          event_id: number
          sort_order: number
        }
        Insert: {
          category_id: number
          event_id: number
          sort_order?: number
        }
        Update: {
          category_id?: number
          event_id?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_category_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string | null
          category_id: number | null
          created_at: string
          created_by: string | null
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          end_time: string | null
          id: number
          image_credit: string | null
          image_edits: string | null
          image_license: string | null
          image_license_url: string | null
          image_source_url: string | null
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          neighborhood_id: number | null
          place_id: number | null
          recurrence_rule: string | null
          recurrence_timezone: string | null
          start_time: string
          title: string
          venue_name: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          end_time?: string | null
          id?: never
          image_credit?: string | null
          image_edits?: string | null
          image_license?: string | null
          image_license_url?: string | null
          image_source_url?: string | null
          image_thumb_url?: string | null
          image_url?: string | null
          location: unknown
          neighborhood_id?: number | null
          place_id?: number | null
          recurrence_rule?: string | null
          recurrence_timezone?: string | null
          start_time: string
          title: string
          venue_name?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: number | null
          created_at?: string
          created_by?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          end_time?: string | null
          id?: never
          image_credit?: string | null
          image_edits?: string | null
          image_license?: string | null
          image_license_url?: string | null
          image_source_url?: string | null
          image_thumb_url?: string | null
          image_url?: string | null
          location?: unknown
          neighborhood_id?: number | null
          place_id?: number | null
          recurrence_rule?: string | null
          recurrence_timezone?: string | null
          start_time?: string
          title?: string
          venue_name?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_dress_code_id_fkey"
            columns: ["dress_code_id"]
            isOneToOne: false
            referencedRelation: "dress_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_events: {
        Row: {
          actor_id: string
          check_in_id: number | null
          created_at: string
          event_type: string
          id: number
          target_id: number | null
          target_profile_id: string | null
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Insert: {
          actor_id: string
          check_in_id?: number | null
          created_at?: string
          event_type: string
          id?: never
          target_id?: number | null
          target_profile_id?: string | null
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Update: {
          actor_id?: string
          check_in_id?: number | null
          created_at?: string
          event_type?: string
          id?: never
          target_id?: number | null
          target_profile_id?: string | null
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "feed_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_events_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_events_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          accepted_push_notified_at: string | null
          addressee_id: string
          created_at: string
          id: number
          push_notified_at: string | null
          requester_id: string
          status: Database["public"]["Enums"]["friend_request_status"]
        }
        Insert: {
          accepted_push_notified_at?: string | null
          addressee_id: string
          created_at?: string
          id?: never
          push_notified_at?: string | null
          requester_id: string
          status?: Database["public"]["Enums"]["friend_request_status"]
        }
        Update: {
          accepted_push_notified_at?: string | null
          addressee_id?: string
          created_at?: string
          id?: never
          push_notified_at?: string | null
          requester_id?: string
          status?: Database["public"]["Enums"]["friend_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          user_id_a: string
          user_id_b: string
        }
        Insert: {
          created_at?: string
          user_id_a: string
          user_id_b: string
        }
        Update: {
          created_at?: string
          user_id_a?: string
          user_id_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_a_fkey"
            columns: ["user_id_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_b_fkey"
            columns: ["user_id_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_trending_items: {
        Row: {
          created_at: string
          enabled: boolean
          ends_at: string | null
          event_id: number | null
          id: number
          place_id: number | null
          playlist_id: number | null
          sort_order: number
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          ends_at?: string | null
          event_id?: number | null
          id?: never
          place_id?: number | null
          playlist_id?: number | null
          sort_order?: number
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          ends_at?: string | null
          event_id?: number | null
          id?: never
          place_id?: number | null
          playlist_id?: number | null
          sort_order?: number
          starts_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "home_trending_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_trending_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_trending_items_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_trending_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_places: {
        Row: {
          created_at: string
          place_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          place_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          place_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liked_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liked_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderators: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: never
          name: string
        }
        Update: {
          id?: never
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          dismissed_at: string | null
          id: number
          read_at: string | null
          target_id: number | null
          target_profile_id: string | null
          target_type: Database["public"]["Enums"]["target_type"] | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: never
          read_at?: string | null
          target_id?: number | null
          target_profile_id?: string | null
          target_type?: Database["public"]["Enums"]["target_type"] | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          dismissed_at?: string | null
          id?: never
          read_at?: string | null
          target_id?: number | null
          target_profile_id?: string | null
          target_type?: Database["public"]["Enums"]["target_type"] | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      place_categories: {
        Row: {
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          id?: never
          name: string
          sort_order?: number
        }
        Update: {
          id?: never
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      place_category_assignments: {
        Row: {
          category_id: number
          place_id: number
          sort_order: number
        }
        Insert: {
          category_id: number
          place_id: number
          sort_order?: number
        }
        Update: {
          category_id?: number
          place_id?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_category_assignments_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_category_assignments_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
        ]
      }
      place_visits: {
        Row: {
          last_visited_at: string | null
          place_id: number
          user_id: string
          visit_count: number
        }
        Insert: {
          last_visited_at?: string | null
          place_id: number
          user_id: string
          visit_count?: number
        }
        Update: {
          last_visited_at?: string | null
          place_id?: number
          user_id?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_visits_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_with_coords"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_visits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          category_id: number | null
          created_at: string
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          embedding: string | null
          id: number
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          name: string
          neighborhood_id: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: number | null
          created_at?: string
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          embedding?: string | null
          id?: never
          image_thumb_url?: string | null
          image_url?: string | null
          location?: unknown
          name: string
          neighborhood_id?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: number | null
          created_at?: string
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          embedding?: string | null
          id?: never
          image_thumb_url?: string | null
          image_url?: string | null
          location?: unknown
          name?: string
          neighborhood_id?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_dress_code_id_fkey"
            columns: ["dress_code_id"]
            isOneToOne: false
            referencedRelation: "dress_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          playlist_id: number
          sort_order: number
          target_id: number
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Insert: {
          playlist_id: number
          sort_order?: number
          target_id: number
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Update: {
          playlist_id?: number
          sort_order?: number
          target_id?: number
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          curator_key: string | null
          description: string | null
          featured: boolean
          id: number
          image_url: string | null
          name: string
          owner_id: string | null
          privacy: Database["public"]["Enums"]["playlist_privacy"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          curator_key?: string | null
          description?: string | null
          featured?: boolean
          id?: never
          image_url?: string | null
          name: string
          owner_id?: string | null
          privacy?: Database["public"]["Enums"]["playlist_privacy"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          curator_key?: string | null
          description?: string | null
          featured?: boolean
          id?: never
          image_url?: string | null
          name?: string
          owner_id?: string | null
          privacy?: Database["public"]["Enums"]["playlist_privacy"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_interests: {
        Row: {
          category_id: number
          profile_id: string
        }
        Insert: {
          category_id: number
          profile_id: string
        }
        Update: {
          category_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accepted_guidelines_version: number | null
          avatar_thumb_url: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          instagram_handle: string | null
          neighborhood_id: number | null
          privacy_state: Database["public"]["Enums"]["privacy_state"]
          username: string
        }
        Insert: {
          accepted_guidelines_version?: number | null
          avatar_thumb_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          instagram_handle?: string | null
          neighborhood_id?: number | null
          privacy_state?: Database["public"]["Enums"]["privacy_state"]
          username: string
        }
        Update: {
          accepted_guidelines_version?: number | null
          avatar_thumb_url?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          instagram_handle?: string | null
          neighborhood_id?: number | null
          privacy_state?: Database["public"]["Enums"]["privacy_state"]
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          enabled: boolean
          expo_push_token: string
          id: number
          last_registered_at: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          expo_push_token: string
          id?: never
          last_registered_at?: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          expo_push_token?: string
          id?: never
          last_registered_at?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: number
          reason: string | null
          reporter_id: string
          target_id: number | null
          target_profile_id: string | null
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Insert: {
          created_at?: string
          id?: never
          reason?: string | null
          reporter_id: string
          target_id?: number | null
          target_profile_id?: string | null
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Update: {
          created_at?: string
          id?: never
          reason?: string | null
          reporter_id?: string
          target_id?: number | null
          target_profile_id?: string | null
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_playlists: {
        Row: {
          created_at: string
          playlist_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          playlist_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          playlist_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_playlists_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      showme_ai_chats: {
        Row: {
          created_at: string
          id: string
          initial_request_id: string
          last_response_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initial_request_id: string
          last_response_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initial_request_id?: string
          last_response_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showme_ai_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      showme_ai_messages: {
        Row: {
          attachment_count: number
          cards: Json
          chat_id: string
          content: string
          created_at: string
          id: number
          request_id: string
          response_id: string | null
          role: string
          tool: string | null
        }
        Insert: {
          attachment_count?: number
          cards?: Json
          chat_id: string
          content?: string
          created_at?: string
          id?: never
          request_id: string
          response_id?: string | null
          role: string
          tool?: string | null
        }
        Update: {
          attachment_count?: number
          cards?: Json
          chat_id?: string
          content?: string
          created_at?: string
          id?: never
          request_id?: string
          response_id?: string | null
          role?: string
          tool?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showme_ai_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "showme_ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      showme_ai_response_jobs: {
        Row: {
          chat_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          request_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          chat_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          request_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          request_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "showme_ai_response_jobs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "showme_ai_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      places_with_coords: {
        Row: {
          address: string | null
          category_id: number | null
          created_at: string | null
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          embedding: string | null
          id: number | null
          image_thumb_url: string | null
          image_url: string | null
          lat: number | null
          lng: number | null
          location: unknown
          name: string | null
          neighborhood_id: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: number | null
          created_at?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          embedding?: string | null
          id?: number | null
          image_thumb_url?: string | null
          image_url?: string | null
          lat?: never
          lng?: never
          location?: unknown
          name?: string | null
          neighborhood_id?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: number | null
          created_at?: string | null
          custom_dress_code?: string | null
          description?: string | null
          dress_code_id?: number | null
          embedding?: string | null
          id?: number | null
          image_thumb_url?: string | null
          image_url?: string | null
          lat?: never
          lng?: never
          location?: unknown
          name?: string | null
          neighborhood_id?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "place_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_dress_code_id_fkey"
            columns: ["dress_code_id"]
            isOneToOne: false
            referencedRelation: "dress_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "places_neighborhood_id_fkey"
            columns: ["neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      accept_friend_request: {
        Args: { p_request_id: number }
        Returns: undefined
      }
      add_place_to_owned_playlists: {
        Args: { requested_playlist_ids: number[]; target_place_id: number }
        Returns: number[]
      }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      append_showme_ai_user_message: {
        Args: {
          p_attachment_count?: number
          p_chat_id: string
          p_prompt: string
          p_request_id: string
          p_tool?: string
        }
        Returns: number
      }
      archive_past_events: { Args: never; Returns: number }
      can_view_checkin: { Args: { p_check_in_id: number }; Returns: boolean }
      can_view_collection: { Args: { p_playlist_id: number }; Returns: boolean }
      cancel_friend_request: {
        Args: { p_request_id: number }
        Returns: boolean
      }
      complete_showme_ai_turn: {
        Args: {
          p_cards?: Json
          p_chat_id: string
          p_request_id: string
          p_response: string
          p_response_id: string
        }
        Returns: number
      }
      create_check_in: {
        Args: {
          requested_duration_minutes: number
          requested_note?: string
          requested_target_id: number
          requested_target_type: string
          requested_visibility?: Database["public"]["Enums"]["checkin_visibility"]
          requested_visible_friend_ids?: string[]
        }
        Returns: number
      }
      create_check_in_comment: {
        Args: { requested_body: string; requested_check_in_id: number }
        Returns: number
      }
      create_playlist_with_places: {
        Args: {
          playlist_description: string
          playlist_name: string
          requested_place_ids: number[]
        }
        Returns: number
      }
      create_showme_ai_chat: {
        Args: {
          p_attachment_count?: number
          p_prompt: string
          p_request_id: string
          p_tool?: string
        }
        Returns: string
      }
      create_showme_ai_playlist: {
        Args: {
          p_description: string
          p_place_ids: number[]
          p_request_id: string
          p_title: string
        }
        Returns: {
          image_url: string
          place_ids: number[]
          playlist_description: string
          playlist_id: number
          playlist_title: string
        }[]
      }
      delete_own_account: { Args: never; Returns: undefined }
      delete_owned_playlist: {
        Args: { target_playlist_id: number }
        Returns: number
      }
      delete_showme_ai_chat: { Args: { p_chat_id: string }; Returns: boolean }
      disablelongtransactions: { Args: never; Returns: string }
      dismiss_own_notifications: { Args: never; Returns: number }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      email_has_existing_account: {
        Args: { candidate_email: string }
        Returns: boolean
      }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      fail_showme_ai_turn: {
        Args: {
          p_cards?: Json
          p_chat_id: string
          p_error_message: string
          p_partial_response?: string
          p_request_id: string
        }
        Returns: boolean
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_most_saved_playlists: {
        Args: never
        Returns: {
          playlist_id: number
          save_count: number
        }[]
      }
      get_mutual_friend_suggestions: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          avatar_thumb_url: string
          avatar_url: string
          display_name: string
          instagram_handle: string
          is_requested: boolean
          mutual_friend_count: number
          neighborhood_name: string
          privacy_state: Database["public"]["Enums"]["privacy_state"]
          profile_id: string
          username: string
        }[]
      }
      get_nearby_check_in_items: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_result_limit?: number
          p_result_type: string
        }
        Returns: {
          category_name: string
          distance_meters: number
          image_thumb_url: string
          image_url: string
          neighborhood_name: string
          result_id: number
          result_type: string
          start_time: string
          title: string
        }[]
      }
      get_own_profile_playlist_counts: {
        Args: never
        Returns: {
          place_count: number
          playlist_id: number
          save_count: number
        }[]
      }
      get_playlist_save_count: {
        Args: { target_playlist_id: number }
        Returns: number
      }
      get_profile_playlist_counts: {
        Args: { p_profile_id: string }
        Returns: {
          place_count: number
          playlist_id: number
          save_count: number
        }[]
      }
      get_social_leaderboard: {
        Args: { p_limit?: number; p_mode: string; p_scope: string }
        Returns: {
          avatar_thumb_url: string
          avatar_url: string
          display_name: string
          instagram_handle: string
          is_friend: boolean
          leaderboard_position: number
          neighborhood_name: string
          privacy_state: Database["public"]["Enums"]["privacy_state"]
          profile_id: string
          score: number
          username: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      invite_friends_to_check_in: {
        Args: { requested_check_in_id: number; requested_friend_ids: string[] }
        Returns: Json
      }
      is_checkin_participant: {
        Args: { p_check_in_id: number }
        Returns: boolean
      }
      is_friend: { Args: { a: string; b: string }; Returns: boolean }
      is_moderator: { Args: never; Returns: boolean }
      is_profile_moderator: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_own_notifications_read: { Args: never; Returns: number }
      mark_showme_ai_response_running: {
        Args: { p_chat_id: string; p_request_id: string }
        Returns: string
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      register_own_push_token: {
        Args: {
          p_expo_push_token: string
          p_platform: string
          p_previous_token?: string
        }
        Returns: undefined
      }
      remove_friend: { Args: { p_other_user_id: string }; Returns: boolean }
      roll_weekly_recurring_events: { Args: never; Returns: number }
      search_check_in_items: {
        Args: {
          p_latitude?: number
          p_longitude?: number
          p_result_limit?: number
          p_result_type: string
          p_search_query: string
        }
        Returns: {
          category_name: string
          distance_meters: number
          image_thumb_url: string
          image_url: string
          neighborhood_name: string
          result_id: number
          result_type: string
          start_time: string
          title: string
        }[]
      }
      search_discover_filtered_ids: {
        Args: {
          p_category_names?: string[]
          p_distance_miles?: number
          p_dress_codes?: string[]
          p_latitude?: number
          p_longitude?: number
          p_neighborhood_names?: string[]
          p_result_limit?: number
          p_result_type: string
          p_search_query: string
        }
        Returns: {
          result_id: number
          total_count: number
        }[]
      }
      search_events: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          address: string | null
          category_id: number | null
          created_at: string
          created_by: string | null
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          end_time: string | null
          id: number
          image_credit: string | null
          image_edits: string | null
          image_license: string | null
          image_license_url: string | null
          image_source_url: string | null
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          neighborhood_id: number | null
          place_id: number | null
          recurrence_rule: string | null
          recurrence_timezone: string | null
          start_time: string
          title: string
          venue_name: string | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      search_people: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          avatar_thumb_url: string
          avatar_url: string
          display_name: string
          instagram_handle: string
          mutual_friend_count: number
          neighborhood_name: string
          privacy_state: Database["public"]["Enums"]["privacy_state"]
          profile_id: string
          relationship_status: string
          username: string
        }[]
      }
      search_places: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          address: string | null
          category_id: number | null
          created_at: string
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          embedding: string | null
          id: number
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          name: string
          neighborhood_id: number | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "places"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      send_friend_request: { Args: { p_addressee_id: string }; Returns: number }
      set_home_trending_status: {
        Args: {
          next_trending_status: boolean
          target_id: number
          target_type: string
        }
        Returns: boolean
      }
      set_place_liked: {
        Args: { next_liked_status: boolean; target_place_id: number }
        Returns: boolean
      }
      set_playlist_featured: {
        Args: { next_featured_status: boolean; target_playlist_id: number }
        Returns: boolean
      }
      set_playlist_saved: {
        Args: { next_saved_status: boolean; target_playlist_id: number }
        Returns: boolean
      }
      set_showme_ai_chat_title: {
        Args: { p_chat_id: string; p_title: string }
        Returns: string
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      top_places_by_checkins: {
        Args: { result_limit?: number }
        Returns: {
          address: string | null
          category_id: number | null
          created_at: string
          custom_dress_code: string | null
          description: string | null
          dress_code_id: number | null
          embedding: string | null
          id: number
          image_thumb_url: string | null
          image_url: string | null
          location: unknown
          name: string
          neighborhood_id: number | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "places"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      unregister_own_push_token: {
        Args: { p_expo_push_token: string }
        Returns: boolean
      }
      update_active_check_in: {
        Args: {
          requested_check_in_id: number
          requested_duration_minutes: number
          requested_note?: string
          requested_visibility?: Database["public"]["Enums"]["checkin_visibility"]
          requested_visible_friend_ids?: string[]
        }
        Returns: Json
      }
      update_active_check_in_visibility: {
        Args: {
          requested_check_in_id: number
          requested_visibility?: Database["public"]["Enums"]["checkin_visibility"]
          requested_visible_friend_ids?: string[]
        }
        Returns: Json
      }
      update_event_media: {
        Args: {
          next_image_thumb_url: string
          next_image_url: string
          target_event_id: number
        }
        Returns: {
          id: number
          image_thumb_url: string
          image_url: string
        }[]
      }
      update_own_profile: {
        Args: {
          profile_avatar_thumb_url?: string
          profile_avatar_url?: string
          profile_display_name: string
          profile_instagram_handle: string
          profile_interest_ids: number[]
          profile_neighborhood_id: number
          profile_privacy_state: Database["public"]["Enums"]["privacy_state"]
          replace_profile_avatar?: boolean
        }
        Returns: Json
      }
      update_playlist_with_places: {
        Args: {
          next_image_url?: string
          playlist_description: string
          playlist_name: string
          requested_place_ids: number[]
          target_playlist_id: number
        }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      checkin_role: "host" | "guest"
      checkin_visibility: "friends" | "private"
      friend_request_status: "pending" | "accepted" | "declined"
      playlist_privacy: "public" | "private"
      privacy_state: "public" | "private"
      target_type: "place" | "event" | "check_in" | "playlist" | "profile"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      checkin_role: ["host", "guest"],
      checkin_visibility: ["friends", "private"],
      friend_request_status: ["pending", "accepted", "declined"],
      playlist_privacy: ["public", "private"],
      privacy_state: ["public", "private"],
      target_type: ["place", "event", "check_in", "playlist", "profile"],
    },
  },
} as const
