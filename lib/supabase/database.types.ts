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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_users: {
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
      admission_inquiries: {
        Row: {
          admin_notes: string | null
          consent_at: string
          created_at: string
          email: string | null
          id: string
          middle_school: string | null
          parent_name: string
          phone: string
          question: string | null
          status: string
          student_name: string
        }
        Insert: {
          admin_notes?: string | null
          consent_at: string
          created_at?: string
          email?: string | null
          id?: string
          middle_school?: string | null
          parent_name: string
          phone: string
          question?: string | null
          status?: string
          student_name: string
        }
        Update: {
          admin_notes?: string | null
          consent_at?: string
          created_at?: string
          email?: string | null
          id?: string
          middle_school?: string | null
          parent_name?: string
          phone?: string
          question?: string | null
          status?: string
          student_name?: string
        }
        Relationships: []
      }
      admissions_info: {
        Row: {
          academic_year: string
          admission_criteria: string
          benchmark_scores: Json
          end_date: string | null
          guide_file_url: string | null
          id: string
          is_active: boolean
          registration_url: string | null
          start_date: string | null
          target_quota: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          admission_criteria: string
          benchmark_scores?: Json
          end_date?: string | null
          guide_file_url?: string | null
          id?: string
          is_active?: boolean
          registration_url?: string | null
          start_date?: string | null
          target_quota: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          admission_criteria?: string
          benchmark_scores?: Json
          end_date?: string | null
          guide_file_url?: string | null
          id?: string
          is_active?: boolean
          registration_url?: string | null
          start_date?: string | null
          target_quota?: number
          updated_at?: string
        }
        Relationships: []
      }
      apple_admins: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      apple_audit_log: {
        Row: {
          action: string
          actor: string | null
          actor_email: string | null
          after: Json | null
          at: string
          before: Json | null
          id: number
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor?: string | null
          actor_email?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          id?: never
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor?: string | null
          actor_email?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          id?: never
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      apple_leads: {
        Row: {
          admin_note: string | null
          client_hash: string | null
          created_at: string
          id: number
          kind: string
          name: string
          note: string | null
          phone: string
          product: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          client_hash?: string | null
          created_at?: string
          id?: never
          kind?: string
          name: string
          note?: string | null
          phone: string
          product?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          client_hash?: string | null
          created_at?: string
          id?: never
          kind?: string
          name?: string
          note?: string | null
          phone?: string
          product?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      apple_settings: {
        Row: {
          address: string | null
          close_time: string | null
          hotline: string
          id: number
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          open_time: string | null
          response_promise: string | null
          updated_at: string
          zalo: string
          zalo_tragop: string
        }
        Insert: {
          address?: string | null
          close_time?: string | null
          hotline?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          open_time?: string | null
          response_promise?: string | null
          updated_at?: string
          zalo?: string
          zalo_tragop?: string
        }
        Update: {
          address?: string | null
          close_time?: string | null
          hotline?: string
          id?: number
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          open_time?: string | null
          response_promise?: string | null
          updated_at?: string
          zalo?: string
          zalo_tragop?: string
        }
        Relationships: []
      }
      bakery: {
        Row: {
          created_at: string
          data: Json
          id: number
          parent_id: number | null
          slug: string | null
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: number
          parent_id?: number | null
          slug?: string | null
          sort_order?: number
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
          parent_id?: number | null
          slug?: string | null
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          advisor_name: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          advisor_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          advisor_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      coffee_site_settings: {
        Row: {
          id: number
          settings: Json
          updated_at: string
        }
        Insert: {
          id?: number
          settings: Json
          updated_at?: string
        }
        Update: {
          id?: number
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          consent_at: string
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          status: string
          subject: string
        }
        Insert: {
          consent_at: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          status?: string
          subject: string
        }
        Update: {
          consent_at?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      documents_forms: {
        Row: {
          category: string
          code_number: string | null
          created_at: string
          file_size: string | null
          file_type: string | null
          file_url: string
          id: string
          issued_date: string | null
          title: string
        }
        Insert: {
          category: string
          code_number?: string | null
          created_at?: string
          file_size?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          issued_date?: string | null
          title: string
        }
        Update: {
          category?: string
          code_number?: string | null
          created_at?: string
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          issued_date?: string | null
          title?: string
        }
        Relationships: []
      }
      faculty_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          degree: string | null
          department: string
          email: string | null
          full_name: string
          id: string
          is_leadership: boolean
          order_index: number
          phone: string | null
          position: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          degree?: string | null
          department: string
          email?: string | null
          full_name: string
          id?: string
          is_leadership?: boolean
          order_index?: number
          phone?: string | null
          position: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          degree?: string | null
          department?: string
          email?: string | null
          full_name?: string
          id?: string
          is_leadership?: boolean
          order_index?: number
          phone?: string | null
          position?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          cta_href: string | null
          cta_label: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      kho_iphone: {
        Row: {
          badge: string | null
          "Dung Lượng RAM/ROM": string | null
          Giá: number | null
          "Hình ảnh sản phẩm 1": string | null
          "Hình ảnh sản phẩm 2": string | null
          "Hình ảnh sản phẩm 3": string | null
          "Hình ảnh sản phẩm 4": string | null
          "Hình ảnh sản phẩm 5": string | null
          "Hình ảnh sản phẩm 6": string | null
          id: number
          is_visible: boolean
          "Mã sản phẩm": string | null
          "Mô tả": string | null
          sale_price: number | null
          stock: number | null
          stt: string | null
          "Tên sản phẩm": string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          "Dung Lượng RAM/ROM"?: string | null
          Giá?: number | null
          "Hình ảnh sản phẩm 1"?: string | null
          "Hình ảnh sản phẩm 2"?: string | null
          "Hình ảnh sản phẩm 3"?: string | null
          "Hình ảnh sản phẩm 4"?: string | null
          "Hình ảnh sản phẩm 5"?: string | null
          "Hình ảnh sản phẩm 6"?: string | null
          id?: number
          is_visible?: boolean
          "Mã sản phẩm"?: string | null
          "Mô tả"?: string | null
          sale_price?: number | null
          stock?: number | null
          stt?: string | null
          "Tên sản phẩm"?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          "Dung Lượng RAM/ROM"?: string | null
          Giá?: number | null
          "Hình ảnh sản phẩm 1"?: string | null
          "Hình ảnh sản phẩm 2"?: string | null
          "Hình ảnh sản phẩm 3"?: string | null
          "Hình ảnh sản phẩm 4"?: string | null
          "Hình ảnh sản phẩm 5"?: string | null
          "Hình ảnh sản phẩm 6"?: string | null
          id?: number
          is_visible?: boolean
          "Mã sản phẩm"?: string | null
          "Mô tả"?: string | null
          sale_price?: number | null
          stock?: number | null
          stt?: string | null
          "Tên sản phẩm"?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string
          is_available: boolean
          is_featured: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string
          is_available?: boolean
          is_featured?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string
          is_available?: boolean
          is_featured?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          author_name: string | null
          category: string
          content: string
          created_at: string
          id: string
          is_featured: boolean
          is_pinned: boolean
          published_at: string
          slug: string
          status: string
          summary: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          published_at?: string
          slug: string
          status?: string
          summary?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          is_pinned?: boolean
          published_at?: string
          slug?: string
          status?: string
          summary?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      photo_galleries: {
        Row: {
          category: string
          created_at: string
          event_date: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          event_date?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          event_date?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      photo_gallery_images: {
        Row: {
          alt: string | null
          created_at: string
          gallery_id: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          alt?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          alt?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "photo_gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "photo_galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      school_admins: {
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
      school_info: {
        Row: {
          address: string
          education_department_url: string | null
          email: string
          established_year: number | null
          facebook_url: string | null
          favicon_url: string | null
          hotline: string | null
          id: boolean
          logo_url: string | null
          map_embed_url: string | null
          name: string
          phone: string
          principal_avatar_url: string | null
          principal_message: string | null
          principal_name: string | null
          principal_title: string | null
          score_lookup_url: string | null
          short_name: string | null
          slogan: string | null
          stats: Json
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address: string
          education_department_url?: string | null
          email: string
          established_year?: number | null
          facebook_url?: string | null
          favicon_url?: string | null
          hotline?: string | null
          id?: boolean
          logo_url?: string | null
          map_embed_url?: string | null
          name: string
          phone: string
          principal_avatar_url?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_title?: string | null
          score_lookup_url?: string | null
          short_name?: string | null
          slogan?: string | null
          stats?: Json
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string
          education_department_url?: string | null
          email?: string
          established_year?: number | null
          facebook_url?: string | null
          favicon_url?: string | null
          hotline?: string | null
          id?: boolean
          logo_url?: string | null
          map_embed_url?: string | null
          name?: string
          phone?: string
          principal_avatar_url?: string | null
          principal_message?: string | null
          principal_name?: string | null
          principal_title?: string | null
          score_lookup_url?: string | null
          short_name?: string | null
          slogan?: string | null
          stats?: Json
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      veloce_admins: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      veloce_categories: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          image_url: string | null
          name: string
          name_en: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      veloce_contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          message: string
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale: string
          message: string
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      veloce_newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      veloce_orders: {
        Row: {
          address: string
          code: string
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          discount: number
          id: string
          items: Json
          note: string | null
          shipping_fee: number
          status: string
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          code: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          discount?: number
          id?: string
          items?: Json
          note?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      veloce_products: {
        Row: {
          badge: string | null
          brand: string
          category_id: string | null
          colors: Json
          created_at: string
          description: string
          description_en: string | null
          features: string[]
          features_en: string[] | null
          id: string
          images: string[]
          is_published: boolean
          name: string
          name_en: string | null
          original_price: number | null
          price: number
          rating: number
          review_count: number
          sizes: number[]
          slug: string
          sort_order: number
          stock: number
          unsplash_id: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          brand?: string
          category_id?: string | null
          colors?: Json
          created_at?: string
          description?: string
          description_en?: string | null
          features?: string[]
          features_en?: string[] | null
          id?: string
          images?: string[]
          is_published?: boolean
          name: string
          name_en?: string | null
          original_price?: number | null
          price: number
          rating?: number
          review_count?: number
          sizes?: number[]
          slug: string
          sort_order?: number
          stock?: number
          unsplash_id?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          brand?: string
          category_id?: string | null
          colors?: Json
          created_at?: string
          description?: string
          description_en?: string | null
          features?: string[]
          features_en?: string[] | null
          id?: string
          images?: string[]
          is_published?: boolean
          name?: string
          name_en?: string | null
          original_price?: number | null
          price?: number
          rating?: number
          review_count?: number
          sizes?: number[]
          slug?: string
          sort_order?: number
          stock?: number
          unsplash_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veloce_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "veloce_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      veloce_settings: {
        Row: {
          address: string | null
          announcement_enabled: boolean
          announcement_text_en: string | null
          announcement_text_vi: string | null
          color_accent: string
          color_primary: string
          color_secondary: string
          coupon_code: string | null
          coupon_percent: number
          email: string | null
          facebook_url: string | null
          freeship_threshold: number
          hero_cta_label_en: string | null
          hero_cta_label_vi: string | null
          hero_headline: string | null
          hero_headline_en: string | null
          hero_image_url: string | null
          hero_secondary_label_en: string | null
          hero_secondary_label_vi: string | null
          hero_subheadline: string | null
          hero_subheadline_en: string | null
          homepage_sections: Json
          id: number
          instagram_url: string | null
          logo_url: string | null
          og_image_url: string | null
          phone: string | null
          seo_description_en: string | null
          seo_description_vi: string | null
          seo_title_en: string | null
          seo_title_vi: string | null
          shipping_fee: number
          slogan: string
          slogan_en: string | null
          store_name: string
          updated_at: string
          zalo_url: string | null
        }
        Insert: {
          address?: string | null
          announcement_enabled?: boolean
          announcement_text_en?: string | null
          announcement_text_vi?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          coupon_code?: string | null
          coupon_percent?: number
          email?: string | null
          facebook_url?: string | null
          freeship_threshold?: number
          hero_cta_label_en?: string | null
          hero_cta_label_vi?: string | null
          hero_headline?: string | null
          hero_headline_en?: string | null
          hero_image_url?: string | null
          hero_secondary_label_en?: string | null
          hero_secondary_label_vi?: string | null
          hero_subheadline?: string | null
          hero_subheadline_en?: string | null
          homepage_sections?: Json
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          phone?: string | null
          seo_description_en?: string | null
          seo_description_vi?: string | null
          seo_title_en?: string | null
          seo_title_vi?: string | null
          shipping_fee?: number
          slogan?: string
          slogan_en?: string | null
          store_name?: string
          updated_at?: string
          zalo_url?: string | null
        }
        Update: {
          address?: string | null
          announcement_enabled?: boolean
          announcement_text_en?: string | null
          announcement_text_vi?: string | null
          color_accent?: string
          color_primary?: string
          color_secondary?: string
          coupon_code?: string | null
          coupon_percent?: number
          email?: string | null
          facebook_url?: string | null
          freeship_threshold?: number
          hero_cta_label_en?: string | null
          hero_cta_label_vi?: string | null
          hero_headline?: string | null
          hero_headline_en?: string | null
          hero_image_url?: string | null
          hero_secondary_label_en?: string | null
          hero_secondary_label_vi?: string | null
          hero_subheadline?: string | null
          hero_subheadline_en?: string | null
          homepage_sections?: Json
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          og_image_url?: string | null
          phone?: string | null
          seo_description_en?: string | null
          seo_description_vi?: string | null
          seo_title_en?: string | null
          seo_title_vi?: string | null
          shipping_fee?: number
          slogan?: string
          slogan_en?: string | null
          store_name?: string
          updated_at?: string
          zalo_url?: string | null
        }
        Relationships: []
      }
      veloce_testimonials: {
        Row: {
          avatar_url: string | null
          content: string
          content_en: string | null
          created_at: string
          id: string
          is_published: boolean
          name: string
          rating: number
          role: string | null
          role_en: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          content_en?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          rating?: number
          role?: string | null
          role_en?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          content_en?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          rating?: number
          role?: string | null
          role_en?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_categories: {
        Row: {
          created_at: string | null
          data: Json | null
          icon: string | null
          id: number | null
          name_i18n: Json | null
          parent_id: number | null
          slug: string | null
          sort_order: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          icon?: never
          id?: number | null
          name_i18n?: never
          parent_id?: number | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          icon?: never
          id?: number | null
          name_i18n?: never
          parent_id?: number | null
          slug?: string | null
          sort_order?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      v_orders: {
        Row: {
          code: string | null
          created_at: string | null
          customer_name: string | null
          data: Json | null
          discount: number | null
          id: number | null
          payment_method: string | null
          phone: string | null
          shipping_fee: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          code?: never
          created_at?: string | null
          customer_name?: never
          data?: Json | null
          discount?: never
          id?: number | null
          payment_method?: never
          phone?: never
          shipping_fee?: never
          status?: string | null
          subtotal?: never
          total?: never
          updated_at?: string | null
          user_id?: never
        }
        Update: {
          code?: never
          created_at?: string | null
          customer_name?: never
          data?: Json | null
          discount?: never
          id?: number | null
          payment_method?: never
          phone?: never
          shipping_fee?: never
          status?: string | null
          subtotal?: never
          total?: never
          updated_at?: string | null
          user_id?: never
        }
        Relationships: []
      }
      v_products: {
        Row: {
          category_id: number | null
          created_at: string | null
          data: Json | null
          id: number | null
          images: Json | null
          is_featured: boolean | null
          name_i18n: Json | null
          price: number | null
          sale_price: number | null
          sku: string | null
          slug: string | null
          sort_order: number | null
          status: string | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          data?: Json | null
          id?: number | null
          images?: never
          is_featured?: never
          name_i18n?: never
          price?: never
          sale_price?: never
          sku?: never
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: never
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          data?: Json | null
          id?: number | null
          images?: never
          is_featured?: never
          name_i18n?: never
          price?: never
          sale_price?: never
          sku?: never
          slug?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: never
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      v_revenue_daily: {
        Row: {
          day: string | null
          orders_count: number | null
          revenue: number | null
        }
        Relationships: []
      }
      v_reviews: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          data: Json | null
          id: number | null
          product_id: number | null
          rating: number | null
          status: string | null
        }
        Insert: {
          author?: never
          content?: never
          created_at?: string | null
          data?: Json | null
          id?: number | null
          product_id?: number | null
          rating?: never
          status?: string | null
        }
        Update: {
          author?: never
          content?: never
          created_at?: string | null
          data?: Json | null
          id?: number | null
          product_id?: number | null
          rating?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "bakery"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bakery_parent_fk"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      apple_list_admins: {
        Args: never
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          role: string
          user_id: string
        }[]
      }
      apple_set_admin: {
        Args: { p_email: string; p_role: string }
        Returns: undefined
      }
      apple_submit_lead: {
        Args: {
          p_client?: string
          p_kind?: string
          p_name: string
          p_note?: string
          p_phone: string
          p_product?: string
        }
        Returns: boolean
      }
      bakery_next_order_code: { Args: never; Returns: string }
      bakery_unaccent: { Args: { txt: string }; Returns: string }
      increment_article_view: {
        Args: { article_slug: string }
        Returns: undefined
      }
      school_is_admin: { Args: never; Returns: boolean }
      school_search: {
        Args: { q: string }
        Returns: {
          excerpt: string
          kind: string
          path: string
          published_at: string
          title: string
        }[]
      }
      school_unaccent: { Args: { t: string }; Returns: string }
      search_products: {
        Args: { result_limit?: number; search_query: string }
        Returns: {
          created_at: string
          data: Json
          id: number
          parent_id: number | null
          slug: string | null
          sort_order: number
          status: string
          type: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bakery"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      veloce_admin_revenue_last_30_days: { Args: never; Returns: number }
      veloce_cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      veloce_place_order: {
        Args: {
          p_address: string
          p_coupon_code?: string
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone: string
          p_items: Json
          p_note?: string
        }
        Returns: {
          order_code: string
          order_id: string
          order_total: number
        }[]
      }
      veloce_place_order_idempotent: {
        Args: {
          p_address: string
          p_coupon_code?: string
          p_customer_email?: string
          p_customer_name: string
          p_customer_phone: string
          p_idempotency_key: string
          p_items: Json
          p_note?: string
        }
        Returns: {
          order_code: string
          order_id: string
          order_total: number
        }[]
      }
      veloce_submit_contact_message: {
        Args: {
          p_email: string
          p_locale: string
          p_message: string
          p_name: string
          p_phone: string
        }
        Returns: undefined
      }
      veloce_subscribe_newsletter: {
        Args: { p_email: string; p_locale: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
