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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_winning: boolean | null
          product_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_winning?: boolean | null
          product_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_winning?: boolean | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          product_id: string | null
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          product_id?: string | null
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_products: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          price: number | null
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          price?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          price?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          company_id: string | null
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          invoice_number: string | null
          issued_at: string | null
          order_id: string
          pdf_url: string | null
          status: string
          updated_at: string
          xml_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          order_id: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
          xml_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          order_id?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_offer_id: string | null
          related_order_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_offer_id?: string | null
          related_order_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_offer_id?: string | null
          related_order_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_offer_id_fkey"
            columns: ["related_offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          admin_notes: string | null
          counter_offer_price: number | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          offer_price: number
          original_price: number | null
          product_id: string
          responded_at: string | null
          responded_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          counter_offer_price?: number | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          offer_price: number
          original_price?: number | null
          product_id: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          counter_offer_price?: number | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          offer_price?: number
          original_price?: number | null
          product_id?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_sku: string
          product_title: string
          quantity: number
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_sku: string
          product_title: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_sku?: string
          product_title?: string
          quantity?: number
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          fiscal_document_url: string | null
          id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          notes: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"]
          requires_invoice: boolean | null
          rfc: string | null
          shipping_address: string
          shipping_city: string | null
          shipping_cost: number | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          fiscal_document_url?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          notes?: string | null
          order_number: string
          order_type?: Database["public"]["Enums"]["order_type"]
          requires_invoice?: boolean | null
          rfc?: string | null
          shipping_address: string
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          fiscal_document_url?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          notes?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"]
          requires_invoice?: boolean | null
          rfc?: string | null
          shipping_address?: string
          shipping_city?: string | null
          shipping_cost?: number | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          is_public: boolean | null
          product_id: string
          question: string
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          is_public?: boolean | null
          product_id: string
          question: string
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          is_public?: boolean | null
          product_id?: string
          question?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          alto_aprox_cm: number | null
          ancho_aprox_cm: number | null
          auction_end: string | null
          auction_min_price: number | null
          auction_start: string | null
          auction_status: string | null
          brand: string
          categories: string[]
          contact_for_quote: boolean | null
          cp_origen: string | null
          created_at: string
          description: string | null
          has_warranty: boolean | null
          hours_of_use: number | null
          id: string
          images: string[]
          is_active: boolean | null
          is_auction: boolean | null
          is_featured: boolean | null
          is_functional: boolean | null
          is_new: boolean | null
          largo_aprox_cm: number | null
          location: string | null
          model: string | null
          original_price: number | null
          peso_aprox_kg: number | null
          price: number | null
          seller_id: string | null
          sku: string
          specifications: Json | null
          stock: number | null
          title: string
          updated_at: string
          warehouse_code: string | null
          warranty_conditions: string | null
          warranty_duration: string | null
          year: number | null
        }
        Insert: {
          alto_aprox_cm?: number | null
          ancho_aprox_cm?: number | null
          auction_end?: string | null
          auction_min_price?: number | null
          auction_start?: string | null
          auction_status?: string | null
          brand: string
          categories?: string[]
          contact_for_quote?: boolean | null
          cp_origen?: string | null
          created_at?: string
          description?: string | null
          has_warranty?: boolean | null
          hours_of_use?: number | null
          id: string
          images?: string[]
          is_active?: boolean | null
          is_auction?: boolean | null
          is_featured?: boolean | null
          is_functional?: boolean | null
          is_new?: boolean | null
          largo_aprox_cm?: number | null
          location?: string | null
          model?: string | null
          original_price?: number | null
          peso_aprox_kg?: number | null
          price?: number | null
          seller_id?: string | null
          sku: string
          specifications?: Json | null
          stock?: number | null
          title: string
          updated_at?: string
          warehouse_code?: string | null
          warranty_conditions?: string | null
          warranty_duration?: string | null
          year?: number | null
        }
        Update: {
          alto_aprox_cm?: number | null
          ancho_aprox_cm?: number | null
          auction_end?: string | null
          auction_min_price?: number | null
          auction_start?: string | null
          auction_status?: string | null
          brand?: string
          categories?: string[]
          contact_for_quote?: boolean | null
          cp_origen?: string | null
          created_at?: string
          description?: string | null
          has_warranty?: boolean | null
          hours_of_use?: number | null
          id?: string
          images?: string[]
          is_active?: boolean | null
          is_auction?: boolean | null
          is_featured?: boolean | null
          is_functional?: boolean | null
          is_new?: boolean | null
          largo_aprox_cm?: number | null
          location?: string | null
          model?: string | null
          original_price?: number | null
          peso_aprox_kg?: number | null
          price?: number | null
          seller_id?: string | null
          sku?: string
          specifications?: Json | null
          stock?: number | null
          title?: string
          updated_at?: string
          warehouse_code?: string | null
          warranty_conditions?: string | null
          warranty_duration?: string | null
          year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          fiscal_document_url: string | null
          full_name: string
          id: string
          phone: string | null
          rfc: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          shipping_state: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          fiscal_document_url?: string | null
          full_name: string
          id?: string
          phone?: string | null
          rfc?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          fiscal_document_url?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          rfc?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          shipping_state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_applications: {
        Row: {
          admin_notes: string | null
          birth_date: string
          company_name: string | null
          created_at: string
          full_name: string
          id: string
          ine_url: string | null
          items_description: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rfc: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          birth_date: string
          company_name?: string | null
          created_at?: string
          full_name: string
          id?: string
          ine_url?: string | null
          items_description: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rfc?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          birth_date?: string
          company_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          ine_url?: string | null
          items_description?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rfc?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          priority: string | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "operador" | "vendedor"
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      order_type: "purchase" | "quote"
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
  public: {
    Enums: {
      app_role: ["admin", "user", "operador", "vendedor"],
      order_status: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      order_type: ["purchase", "quote"],
    },
  },
} as const
