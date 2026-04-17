import { supabase } from '@/lib/supabase';
import type { DBOrder, DeliveryAddress, OrderItem } from '@/lib/types';

export const OrderService = {
  async createOrder(order: {
    buyer_id: string;
    seller_id: string;
    post_id?: string | null;
    items: OrderItem[];
    delivery_address: DeliveryAddress;
    payment_method: string;
    subtotal: number;
    total: number;
    currency: string;
    delivery_type: string;
    notes?: string;
  }): Promise<{ data: DBOrder | null; error: string | null }> {
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        status: 'new',
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
      })
      .select('*, buyer:buyer_id(username, avatar_url), seller:seller_id(username, avatar_url)')
      .single();

    if (!error && data) {
      // Credit seller wallet (90% after 10% commission)
      const sellerEarning = order.total * 0.9;
      await supabase.from('wallet_transactions').insert({
        user_id: order.seller_id,
        type: 'credit',
        amount: sellerEarning,
        description: `Order ${(data as any).order_number} — after 10% commission`,
        order_id: data.id,
        status: 'pending',
      });

      // Update wallet balance
      await supabase.rpc('increment_wallet', {
        uid: order.seller_id,
        amount: sellerEarning,
      }).catch(() => {});
    }

    return { data: data as DBOrder | null, error: error?.message ?? null };
  },

  async getBuyerOrders(buyerId: string): Promise<{ data: DBOrder[]; error: string | null }> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, seller:seller_id(username, avatar_url, display_name), post:post_id(drop_title, media_urls)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    return { data: (data as DBOrder[]) ?? [], error: error?.message ?? null };
  },

  async getSellerOrders(sellerId: string): Promise<{ data: DBOrder[]; error: string | null }> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyer:buyer_id(username, avatar_url, display_name), post:post_id(drop_title, media_urls, price_text)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    return { data: (data as DBOrder[]) ?? [], error: error?.message ?? null };
  },

  async updateOrderStatus(
    orderId: string,
    status: DBOrder['status'],
    sellerId: string
  ): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('seller_id', sellerId);

    if (!error && status === 'delivered') {
      // Mark wallet credit as completed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'completed' })
        .eq('order_id', orderId)
        .eq('type', 'credit');
    }

    return { error: error?.message ?? null };
  },

  async getOrderById(orderId: string): Promise<{ data: DBOrder | null; error: string | null }> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyer:buyer_id(username, avatar_url), seller:seller_id(username, avatar_url)')
      .eq('id', orderId)
      .single();
    return { data: data as DBOrder | null, error: error?.message ?? null };
  },

  async getSellerRevenue(sellerId: string): Promise<{ total: number; pending: number }> {
    const { data } = await supabase
      .from('wallet_transactions')
      .select('amount, status')
      .eq('user_id', sellerId)
      .eq('type', 'credit');

    const total = (data ?? []).reduce((s: number, t: any) => s + (t.amount || 0), 0);
    const pending = (data ?? []).filter((t: any) => t.status === 'pending').reduce((s: number, t: any) => s + (t.amount || 0), 0);
    return { total, pending };
  },
};
