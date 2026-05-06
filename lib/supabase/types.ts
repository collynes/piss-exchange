// Hand-written types matching the migration schema.
// After linking your Supabase project, replace with:
//   npx supabase gen types typescript --linked > lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      countries: {
        Row: { id: string; code: string; name: string; currency: string; currency_sym: string; regulator: string; created_at: string }
        Insert: { id?: string; code: string; name: string; currency: string; currency_sym: string; regulator: string; created_at?: string }
        Update: { id?: string; code?: string; name?: string; currency?: string; currency_sym?: string; regulator?: string; created_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; role: Database['public']['Enums']['user_role']; org_name: string; phone: string | null; license_no: string | null; doc_url: string | null; verified: boolean; country_id: string | null; created_at: string; updated_at: string }
        Insert: { id: string; role?: Database['public']['Enums']['user_role']; org_name: string; phone?: string | null; license_no?: string | null; doc_url?: string | null; verified?: boolean; country_id?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; role?: Database['public']['Enums']['user_role']; org_name?: string; phone?: string | null; license_no?: string | null; doc_url?: string | null; verified?: boolean; country_id?: string | null; updated_at?: string }
        Relationships: [
          { foreignKeyName: "profiles_country_id_fkey"; columns: ["country_id"]; isOneToOne: false; referencedRelation: "countries"; referencedColumns: ["id"] }
        ]
      }
      platform_settings: {
        Row: { key: string; value: string; updated_at: string }
        Insert: { key: string; value: string; updated_at?: string }
        Update: { key?: string; value?: string; updated_at?: string }
        Relationships: []
      }
      drugs: {
        Row: { id: string; generic_name: string; slug: string; atc_code: string | null; dosage_form: string; strength: string; category: string; country_id: string | null; active: boolean; created_at: string }
        Insert: { id?: string; generic_name: string; slug: string; atc_code?: string | null; dosage_form: string; strength: string; category: string; country_id?: string | null; active?: boolean; created_at?: string }
        Update: { id?: string; generic_name?: string; slug?: string; atc_code?: string | null; dosage_form?: string; strength?: string; category?: string; country_id?: string | null; active?: boolean; created_at?: string }
        Relationships: [
          { foreignKeyName: "drugs_country_id_fkey"; columns: ["country_id"]; isOneToOne: false; referencedRelation: "countries"; referencedColumns: ["id"] }
        ]
      }
      listings: {
        Row: { id: string; drug_id: string; seller_id: string; brand_name: string; manufacturer: string | null; origin_country: string; qty_available: number; qty_remaining: number; price_per_unit: number; min_order_qty: number; batch_no: string | null; expiry_date: string | null; listing_expiry: string | null; status: Database['public']['Enums']['listing_status']; created_at: string; updated_at: string }
        Insert: { id?: string; drug_id: string; seller_id: string; brand_name: string; manufacturer?: string | null; origin_country: string; qty_available: number; qty_remaining: number; price_per_unit: number; min_order_qty?: number; batch_no?: string | null; expiry_date?: string | null; listing_expiry?: string | null; status?: Database['public']['Enums']['listing_status']; created_at?: string; updated_at?: string }
        Update: { id?: string; drug_id?: string; seller_id?: string; brand_name?: string; manufacturer?: string | null; origin_country?: string; qty_available?: number; qty_remaining?: number; price_per_unit?: number; min_order_qty?: number; batch_no?: string | null; expiry_date?: string | null; listing_expiry?: string | null; status?: Database['public']['Enums']['listing_status']; updated_at?: string }
        Relationships: [
          { foreignKeyName: "listings_drug_id_fkey"; columns: ["drug_id"]; isOneToOne: false; referencedRelation: "drugs"; referencedColumns: ["id"] },
          { foreignKeyName: "listings_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
      }
      bids: {
        Row: { id: string; drug_id: string; buyer_id: string; qty: number; price_per_unit: number; expires_at: string; status: Database['public']['Enums']['bid_status']; created_at: string }
        Insert: { id?: string; drug_id: string; buyer_id: string; qty: number; price_per_unit: number; expires_at: string; status?: Database['public']['Enums']['bid_status']; created_at?: string }
        Update: { id?: string; drug_id?: string; buyer_id?: string; qty?: number; price_per_unit?: number; expires_at?: string; status?: Database['public']['Enums']['bid_status'] }
        Relationships: [
          { foreignKeyName: "bids_drug_id_fkey"; columns: ["drug_id"]; isOneToOne: false; referencedRelation: "drugs"; referencedColumns: ["id"] },
          { foreignKeyName: "bids_buyer_id_fkey"; columns: ["buyer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
      }
      orders: {
        Row: { id: string; listing_id: string | null; bid_id: string | null; drug_id: string; buyer_id: string; seller_id: string; qty: number; price_per_unit: number; total_amount: number; status: Database['public']['Enums']['order_status']; escrow_status: Database['public']['Enums']['escrow_status']; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; listing_id?: string | null; bid_id?: string | null; drug_id: string; buyer_id: string; seller_id: string; qty: number; price_per_unit: number; total_amount: number; status?: Database['public']['Enums']['order_status']; escrow_status?: Database['public']['Enums']['escrow_status']; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { listing_id?: string | null; bid_id?: string | null; drug_id?: string; buyer_id?: string; seller_id?: string; qty?: number; price_per_unit?: number; total_amount?: number; status?: Database['public']['Enums']['order_status']; escrow_status?: Database['public']['Enums']['escrow_status']; notes?: string | null; updated_at?: string }
        Relationships: [
          { foreignKeyName: "orders_drug_id_fkey"; columns: ["drug_id"]; isOneToOne: false; referencedRelation: "drugs"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_buyer_id_fkey"; columns: ["buyer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_listing_id_fkey"; columns: ["listing_id"]; isOneToOne: false; referencedRelation: "listings"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_bid_id_fkey"; columns: ["bid_id"]; isOneToOne: false; referencedRelation: "bids"; referencedColumns: ["id"] }
        ]
      }
      payments: {
        Row: { id: string; order_id: string; amount: number; currency: string; method: Database['public']['Enums']['payment_method']; mpesa_checkout_id: string | null; mpesa_ref: string | null; status: Database['public']['Enums']['payment_status']; escrow_released_at: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; order_id: string; amount: number; currency?: string; method?: Database['public']['Enums']['payment_method']; mpesa_checkout_id?: string | null; mpesa_ref?: string | null; status?: Database['public']['Enums']['payment_status']; escrow_released_at?: string | null; created_at?: string; updated_at?: string }
        Update: { order_id?: string; amount?: number; currency?: string; method?: Database['public']['Enums']['payment_method']; mpesa_checkout_id?: string | null; mpesa_ref?: string | null; status?: Database['public']['Enums']['payment_status']; escrow_released_at?: string | null; updated_at?: string }
        Relationships: [
          { foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
      }
      trades: {
        Row: { id: string; order_id: string; drug_id: string; buyer_id: string; seller_id: string; qty: number; price_per_unit: number; total_amount: number; executed_at: string }
        Insert: { id?: string; order_id: string; drug_id: string; buyer_id: string; seller_id: string; qty: number; price_per_unit: number; total_amount: number; executed_at?: string }
        Update: { [_ in never]: never }
        Relationships: [
          { foreignKeyName: "trades_drug_id_fkey"; columns: ["drug_id"]; isOneToOne: false; referencedRelation: "drugs"; referencedColumns: ["id"] },
          { foreignKeyName: "trades_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
      }
      market_data: {
        Row: { drug_id: string; last_price: number | null; prev_price: number | null; change_pct: number; volume_today: number; vwap: number | null; deals_today: number; turnover_today: number; updated_at: string }
        Insert: { drug_id: string; last_price?: number | null; prev_price?: number | null; change_pct?: number; volume_today?: number; vwap?: number | null; deals_today?: number; turnover_today?: number; updated_at?: string }
        Update: { drug_id?: string; last_price?: number | null; prev_price?: number | null; change_pct?: number; volume_today?: number; vwap?: number | null; deals_today?: number; turnover_today?: number; updated_at?: string }
        Relationships: [
          { foreignKeyName: "market_data_drug_id_fkey"; columns: ["drug_id"]; isOneToOne: true; referencedRelation: "drugs"; referencedColumns: ["id"] }
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
      user_role: 'buyer' | 'seller' | 'admin'
      listing_status: 'active' | 'filled' | 'expired' | 'cancelled'
      bid_status: 'open' | 'accepted' | 'expired' | 'cancelled'
      order_status: 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'disputed'
      escrow_status: 'holding' | 'released' | 'refunded'
      payment_method: 'mpesa' | 'bank_transfer'
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
