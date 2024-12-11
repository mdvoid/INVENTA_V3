export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiry_date: string;
  warehouse_id: string;
  threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface WastageRecord {
  id: string;
  item_id: string;
  quantity: number;
  reason: string;
  date: string;
}

export interface SaleRecord {
  id: string;
  item_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  date: string;
}