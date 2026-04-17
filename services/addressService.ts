import { supabase } from '@/lib/supabase';
import type { DBAddress } from '@/lib/types';

export const AddressService = {
  async getAddresses(userId: string): Promise<{ data: DBAddress[]; error: string | null }> {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    return { data: (data as DBAddress[]) ?? [], error: error?.message ?? null };
  },

  async getDefaultAddress(userId: string): Promise<DBAddress | null> {
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .maybeSingle();
    return data as DBAddress | null;
  },

  async saveAddress(address: Omit<DBAddress, 'id' | 'created_at'>): Promise<{ data: DBAddress | null; error: string | null }> {
    if (address.is_default) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', address.user_id);
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert(address)
      .select('*')
      .single();

    return { data: data as DBAddress | null, error: error?.message ?? null };
  },

  async updateAddress(addressId: string, updates: Partial<DBAddress>): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', addressId);
    return { error: error?.message ?? null };
  },

  async deleteAddress(addressId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);
    return { error: error?.message ?? null };
  },
};
