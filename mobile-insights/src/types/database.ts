export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
          url: string | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug?: string | null;
          url?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string | null;
          url?: string | null;
          logo_url?: string | null;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          id: number;
          company_id: number | null;
          name: string;
          slug: string | null;
          url: string | null;
          image_url: string | null;
          announced_year: number | null;
          is_extracted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          company_id?: number | null;
          name: string;
          slug?: string | null;
          url?: string | null;
          image_url?: string | null;
          announced_year?: number | null;
          is_extracted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          company_id?: number | null;
          name?: string;
          slug?: string | null;
          url?: string | null;
          image_url?: string | null;
          announced_year?: number | null;
          is_extracted?: boolean;
        };
        Relationships: [];
      };
      specifications: {
        Row: {
          id: number;
          device_id: number | null;
          category: string | null;
          spec_name: string | null;
          spec_value: string | null;
        };
        Insert: {
          id?: number;
          device_id?: number | null;
          category?: string | null;
          spec_name?: string | null;
          spec_value?: string | null;
        };
        Update: {
          id?: number;
          device_id?: number | null;
          category?: string | null;
          spec_name?: string | null;
          spec_value?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
        };
        Relationships: [];
      };
      user_reviews: {
        Row: {
          id: number;
          device_id: number | null;
          user_id: string | null;
          rating: number | null;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          device_id?: number | null;
          user_id?: string | null;
          rating?: number | null;
          review_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          device_id?: number | null;
          user_id?: string | null;
          rating?: number | null;
          review_text?: string | null;
        };
        Relationships: [];
      };
      editorial_reviews: {
        Row: {
          id: number;
          device_id: number | null;
          author_id: string | null;
          title: string | null;
          content: string | null;
          cover_image: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          device_id?: number | null;
          author_id?: string | null;
          title?: string | null;
          content?: string | null;
          cover_image?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          device_id?: number | null;
          author_id?: string | null;
          title?: string | null;
          content?: string | null;
          cover_image?: string | null;
          published_at?: string | null;
        };
        Relationships: [];
      };
      news_articles: {
        Row: {
          id: number;
          author_id: string | null;
          title: string;
          slug: string | null;
          content: string | null;
          cover_image: string | null;
          tags: string[] | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          author_id?: string | null;
          title: string;
          slug?: string | null;
          content?: string | null;
          cover_image?: string | null;
          tags?: string[] | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          author_id?: string | null;
          title?: string;
          slug?: string | null;
          content?: string | null;
          cover_image?: string | null;
          tags?: string[] | null;
          published_at?: string | null;
        };
        Relationships: [];
      };
      ai_insights: {
        Row: {
          id: number;
          insight_type: string;
          reference_key: string;
          device_id: number | null;
          content: Json | null;
          model_used: string | null;
          generated_at: string;
        };
        Insert: {
          id?: number;
          insight_type: string;
          reference_key: string;
          device_id?: number | null;
          content?: Json | null;
          model_used?: string | null;
          generated_at?: string;
        };
        Update: {
          id?: number;
          insight_type?: string;
          reference_key?: string;
          device_id?: number | null;
          content?: Json | null;
          model_used?: string | null;
          generated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row types
export type Company         = Database["public"]["Tables"]["companies"]["Row"];
export type Device          = Database["public"]["Tables"]["devices"]["Row"];
export type Spec            = Database["public"]["Tables"]["specifications"]["Row"];
export type UserRow         = Database["public"]["Tables"]["users"]["Row"];
export type UserReview      = Database["public"]["Tables"]["user_reviews"]["Row"];
export type EditorialReview = Database["public"]["Tables"]["editorial_reviews"]["Row"];
export type NewsArticle     = Database["public"]["Tables"]["news_articles"]["Row"];
export type AiInsight       = Database["public"]["Tables"]["ai_insights"]["Row"];

// Extended types with joins
export type DeviceWithCompany = Device & { company: Company | null };
export type DeviceWithSpecs   = Device & { company: Company | null; specifications: Spec[] };

export type SpecGroup = {
  category: string;
  specs: { name: string; value: string }[];
};
