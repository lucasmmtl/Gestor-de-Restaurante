export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    CompositeTypes: Record<string, never>;
    Enums: {
      app_role: 'admin' | 'staff';
      modifier_type: 'complement' | 'sauce';
      order_status: 'pending' | 'paid' | 'cancelled';
      stock_item_type: 'product' | 'ingredient' | 'complement';
      stock_movement_type: 'entrada' | 'saida';
    };
    Functions: {
      create_order_with_items: {
        Args: {
          p_items: Json;
          p_mark_as_paid?: boolean;
        };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      mark_order_paid: {
        Args: {
          p_order_id: string;
        };
        Returns: Database['public']['Tables']['orders']['Row'];
      };
      register_stock_movement: {
        Args: {
          p_quantity: number;
          p_stock_item_id: string;
          p_type: Database['public']['Enums']['stock_movement_type'];
        };
        Returns: Database['public']['Tables']['stock_items']['Row'];
      };
    };
    Tables: {
      categories: {
        Insert: {
          id?: string;
          name: string;
        };
        Row: {
          id: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      modifier_group_items: {
        Insert: {
          group_id: string;
          id?: string;
          modifier_id: string;
        };
        Row: {
          group_id: string;
          id: string;
          modifier_id: string;
        };
        Update: {
          group_id?: string;
          id?: string;
          modifier_id?: string;
        };
      };
      modifier_groups: {
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          max_select?: number;
          min_select?: number;
          name: string;
          required?: boolean;
        };
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          max_select: number;
          min_select: number;
          name: string;
          required: boolean;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          max_select?: number;
          min_select?: number;
          name?: string;
          required?: boolean;
        };
      };
      modifier_stock: {
        Insert: {
          modifier_id: string;
          quantity_used: number;
          stock_item_id: string;
        };
        Row: {
          modifier_id: string;
          quantity_used: number;
          stock_item_id: string;
        };
        Update: {
          modifier_id?: string;
          quantity_used?: number;
          stock_item_id?: string;
        };
      };
      modifiers: {
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name: string;
          price?: number;
          type: Database['public']['Enums']['modifier_type'];
        };
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          name: string;
          price: number;
          type: Database['public']['Enums']['modifier_type'];
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          name?: string;
          price?: number;
          type?: Database['public']['Enums']['modifier_type'];
        };
      };
      order_item_modifiers: {
        Insert: {
          id?: string;
          modifier_id?: string | null;
          name?: string | null;
          order_item_id: string;
          price?: number;
        };
        Row: {
          id: string;
          modifier_id: string | null;
          name: string | null;
          order_item_id: string;
          price: number;
        };
        Update: {
          id?: string;
          modifier_id?: string | null;
          name?: string | null;
          order_item_id?: string;
          price?: number;
        };
      };
      order_items: {
        Insert: {
          id?: string;
          name?: string | null;
          order_id: string;
          price: number;
          product_id?: string | null;
          quantity: number;
        };
        Row: {
          id: string;
          name: string | null;
          order_id: string;
          price: number;
          product_id: string | null;
          quantity: number;
        };
        Update: {
          id?: string;
          name?: string | null;
          order_id?: string;
          price?: number;
          product_id?: string | null;
          quantity?: number;
        };
      };
      orders: {
        Insert: {
          created_at?: string;
          id?: string;
          status?: Database['public']['Enums']['order_status'];
          stock_deducted_at?: string | null;
          total?: number;
        };
        Row: {
          created_at: string;
          id: string;
          status: Database['public']['Enums']['order_status'];
          stock_deducted_at: string | null;
          total: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          status?: Database['public']['Enums']['order_status'];
          stock_deducted_at?: string | null;
          total?: number;
        };
      };
      product_categories: {
        Insert: {
          category_id: string;
          product_id: string;
        };
        Row: {
          category_id: string;
          product_id: string;
        };
        Update: {
          category_id?: string;
          product_id?: string;
        };
      };
      product_modifier_groups: {
        Insert: {
          group_id: string;
          id?: string;
          product_id: string;
        };
        Row: {
          group_id: string;
          id: string;
          product_id: string;
        };
        Update: {
          group_id?: string;
          id?: string;
          product_id?: string;
        };
      };
      product_modifiers: {
        Insert: {
          id?: string;
          modifier_id: string;
          product_id: string;
        };
        Row: {
          id: string;
          modifier_id: string;
          product_id: string;
        };
        Update: {
          id?: string;
          modifier_id?: string;
          product_id?: string;
        };
      };
      product_stock: {
        Insert: {
          product_id: string;
          quantity_used: number;
          stock_item_id: string;
        };
        Row: {
          product_id: string;
          quantity_used: number;
          stock_item_id: string;
        };
        Update: {
          product_id?: string;
          quantity_used?: number;
          stock_item_id?: string;
        };
      };
      products: {
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name: string;
          price: number;
        };
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          name: string;
          price: number;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          name?: string;
          price?: number;
        };
      };
      profiles: {
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          role?: Database['public']['Enums']['app_role'];
        };
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          role: Database['public']['Enums']['app_role'];
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          role?: Database['public']['Enums']['app_role'];
        };
      };
      stock_items: {
        Insert: {
          id?: string;
          min_quantity?: number;
          name: string;
          quantity?: number;
          type?: Database['public']['Enums']['stock_item_type'];
          unit: string;
        };
        Row: {
          id: string;
          min_quantity: number;
          name: string;
          quantity: number;
          type: Database['public']['Enums']['stock_item_type'];
          unit: string;
        };
        Update: {
          id?: string;
          min_quantity?: number;
          name?: string;
          quantity?: number;
          type?: Database['public']['Enums']['stock_item_type'];
          unit?: string;
        };
      };
      stock_movements: {
        Insert: {
          created_at?: string;
          id?: string;
          quantity: number;
          stock_item_id: string;
          type: Database['public']['Enums']['stock_movement_type'];
        };
        Row: {
          created_at: string;
          id: string;
          quantity: number;
          stock_item_id: string;
          type: Database['public']['Enums']['stock_movement_type'];
        };
        Update: {
          created_at?: string;
          id?: string;
          quantity?: number;
          stock_item_id?: string;
          type?: Database['public']['Enums']['stock_movement_type'];
        };
      };
    };
    Views: Record<string, never>;
  };
};
