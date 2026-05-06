export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      bids: {
        Row: {
          buyer_id: string
          created_at: string | null
          drug_id: string
          expires_at: string
          id: string
          price_per_unit: number
          qty: number
          status: Database["public"]["Enums"]["bid_status"]
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          drug_id: string
          expires_at: string
          id?: string
          price_per_unit: number
          qty: number
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          drug_id?: string
          expires_at?: string
          id?: string
          price_per_unit?: number
          qty?: number
          status?: Database["public"]["Enums"]["bid_status"]
        }
        Relationships: [
          {
            foreignKeyName: "bids_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          currency: string
          currency_sym: string
          id: string
          name: string
          regulator: string
        }
        Insert: {
          code: string
          created_at?: string | null
          currency: string
          currency_sym: string
          id?: string
          name: string
          regulator: string
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string
          currency_sym?: string
          id?: string
          name?: string
          regulator?: string
        }
        Relationships: []
      }
      drugs: {
        Row: {
          active: boolean
          atc_code: string | null
          category: string
          country_id: string | null
          created_at: string | null
          dosage_form: string
          generic_name: string
          id: string
          slug: string
          strength: string
        }
        Insert: {
          active?: boolean
          atc_code?: string | null
          category: string
          country_id?: string | null
          created_at?: string | null
          dosage_form: string
          generic_name: string
          id?: string
          slug: string
          strength: string
        }
        Update: {
          active?: boolean
          atc_code?: string | null
          category?: string
          country_id?: string | null
          created_at?: string | null
          dosage_form?: string
          generic_name?: string
          id?: string
          slug?: string
          strength?: string
        }
        Relationships: [
          {
            foreignKeyName: "drugs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          batch_no: string | null
          brand_name: string
          created_at: string | null
          drug_id: string
          expiry_date: string | null
          id: string
          listing_expiry: string | null
          manufacturer: string | null
          min_order_qty: number
          origin_country: string
          price_per_unit: number
          qty_available: number
          qty_remaining: number
          seller_id: string
          status: Database["public"]["Enums"]["listing_status"]
          updated_at: string | null
        }
        Insert: {
          batch_no?: string | null
          brand_name: string
          created_at?: string | null
          drug_id: string
          expiry_date?: string | null
          id?: string
          listing_expiry?: string | null
          manufacturer?: string | null
          min_order_qty?: number
          origin_country: string
          price_per_unit: number
          qty_available: number
          qty_remaining: number
          seller_id: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string | null
        }
        Update: {
          batch_no?: string | null
          brand_name?: string
          created_at?: string | null
          drug_id?: string
          expiry_date?: string | null
          id?: string
          listing_expiry?: string | null
          manufacturer?: string | null
          min_order_qty?: number
          origin_country?: string
          price_per_unit?: number
          qty_available?: number
          qty_remaining?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["listing_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          change_pct: number | null
          deals_today: number | null
          drug_id: string
          last_price: number | null
          prev_price: number | null
          turnover_today: number | null
          updated_at: string | null
          volume_today: number | null
          vwap: number | null
        }
        Insert: {
          change_pct?: number | null
          deals_today?: number | null
          drug_id: string
          last_price?: number | null
          prev_price?: number | null
          turnover_today?: number | null
          updated_at?: string | null
          volume_today?: number | null
          vwap?: number | null
        }
        Update: {
          change_pct?: number | null
          deals_today?: number | null
          drug_id?: string
          last_price?: number | null
          prev_price?: number | null
          turnover_today?: number | null
          updated_at?: string | null
          volume_today?: number | null
          vwap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_data_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: true
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bid_id: string | null
          buyer_id: string
          created_at: string | null
          drug_id: string
          escrow_status: Database["public"]["Enums"]["escrow_status"]
          id: string
          listing_id: string | null
          notes: string | null
          price_per_unit: number
          qty: number
          seller_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          bid_id?: string | null
          buyer_id: string
          created_at?: string | null
          drug_id: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          id?: string
          listing_id?: string | null
          notes?: string | null
          price_per_unit: number
          qty: number
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          bid_id?: string | null
          buyer_id?: string
          created_at?: string | null
          drug_id?: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          id?: string
          listing_id?: string | null
          notes?: string | null
          price_per_unit?: number
          qty?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          escrow_released_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          mpesa_checkout_id: string | null
          mpesa_ref: string | null
          order_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          escrow_released_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          mpesa_checkout_id?: string | null
          mpesa_ref?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          escrow_released_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          mpesa_checkout_id?: string | null
          mpesa_ref?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_id: string | null
          created_at: string | null
          doc_url: string | null
          id: string
          license_no: string | null
          org_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          verified: boolean
        }
        Insert: {
          country_id?: string | null
          created_at?: string | null
          doc_url?: string | null
          id: string
          license_no?: string | null
          org_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verified?: boolean
        }
        Update: {
          country_id?: string | null
          created_at?: string | null
          doc_url?: string | null
          id?: string
          license_no?: string | null
          org_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          buyer_id: string
          drug_id: string
          executed_at: string
          id: string
          order_id: string
          price_per_unit: number
          qty: number
          seller_id: string
          total_amount: number
        }
        Insert: {
          buyer_id: string
          drug_id: string
          executed_at?: string
          id?: string
          order_id: string
          price_per_unit: number
          qty: number
          seller_id: string
          total_amount: number
        }
        Update: {
          buyer_id?: string
          drug_id?: string
          executed_at?: string
          id?: string
          order_id?: string
          price_per_unit?: number
          qty?: number
          seller_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "trades_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_drug_id_fkey"
            columns: ["drug_id"]
            isOneToOne: false
            referencedRelation: "drugs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bid_status: "open" | "accepted" | "expired" | "cancelled"
      escrow_status: "holding" | "released" | "refunded"
      listing_status: "active" | "filled" | "expired" | "cancelled"
      order_status:
        | "pending"
        | "paid"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "disputed"
      payment_method: "mpesa" | "bank_transfer"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      user_role: "buyer" | "seller" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bid_status: ["open", "accepted", "expired", "cancelled"],
      escrow_status: ["holding", "released", "refunded"],
      listing_status: ["active", "filled", "expired", "cancelled"],
      order_status: [
        "pending",
        "paid",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "disputed",
      ],
      payment_method: ["mpesa", "bank_transfer"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["buyer", "seller", "admin"],
    },
  },
} as const
