import { supabase } from '../lib/supabase';
import { InventoryItem, Warehouse, WastageRecord, SaleRecord } from '../types';

export const inventoryService = {
  // Inventory Items
  async getInventory() {
    console.log('Fetching inventory...');
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        warehouse:warehouses(id, name)
      `)
      .order('name');
    
    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
    
    console.log('Fetched inventory:', data);
    return data as InventoryItem[];
  },

  async addItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) {
    console.log('Adding item:', item);
    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding item:', error);
      throw error;
    }
    
    console.log('Added item:', data);
    return data as InventoryItem;
  },

  async updateItem(id: string, updates: Partial<InventoryItem>) {
    console.log('Updating item:', id, updates);
    const { data, error } = await supabase
      .from('inventory')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }
    
    console.log('Updated item:', data);
    return data as InventoryItem;
  },

  // ... rest of the service remains the same
};