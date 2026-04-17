import { supabase } from '@/lib/supabase';
import { DbOrder, DeliveryAddress, OrderItem } from '@/lib/types';

export const OrderService = {
  // Create order
  async create(params: {
    buyerId: string;
    sellerId: string;
    postId: string | null;
    items: OrderItem[];
    deliveryAddress: DeliveryAddress;
    paymentMethod: 'mobilemoney' | 'card' | 'delivery';
    subtotal: number;
    total: number;
    currency: string;
    deliveryType: string;
  }): Promise<DbOrder | null> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        buyer_id: params.buyerId,
        seller_id: params.sellerId,
        post_id: params.postId,
        items: params.items,
        delivery_address: params.deliveryAddress,
        payment_method: params.paymentMethod,
        subtotal: params.subtotal,
        total: params.total,
        currency: params.currency,
        status: 'new',
        delivery_type: params.deliveryType,
        estimated_delivery: getEstimatedDelivery(),
      })
      .select()
      .single();
    if (error) { console.error('OrderService.create:', error.message); return null; }

    // Trigger wallet credit to seller (minus 10% commission)
    const earnings = params.total * 0.9;
    await supabase.from('wallet_transactions').insert({
      user_id: params.sellerId,
      type: 'credit',
      amount: earnings,
      description: `Order ${(data as any).order_number} — after 10% commission`,
      order_id: (data as any).id,
      status: 'pending',
    });

    // Update seller wallet balance
    const { data: sellerProfile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', params.sellerId)
      .single();
    if (sellerProfile) {
      await supabase.from('user_profiles').update({
        wallet_balance: ((sellerProfile as any).wallet_balance || 0) + earnings,
      }).eq('id', params.sellerId);
    }

    // Create notification for seller
    await supabase.from('notifications').insert({
      user_id: params.sellerId,
      type: 'order',
      title: 'New Order Received!',
      body: `You have a new order — ${(data as any).order_number}`,
      related_id: (data as any).id,
      related_type: 'order',
      read: false,
    });

    return data as DbOrder;
  },

  // Get orders for buyer
  async getForBuyer(buyerId: string): Promise<DbOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, seller:seller_id(id,username,avatar_url,verified)')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as DbOrder[];
  },

  // Get orders for seller
  async getForSeller(sellerId: string): Promise<DbOrder[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyer:buyer_id(id,username,avatar_url,verified)')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as DbOrder[];
  },

  // Get single order
  async getById(orderId: string): Promise<DbOrder | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyer:buyer_id(*), seller:seller_id(*)')
      .eq('id', orderId)
      .single();
    if (error) return null;
    return data as DbOrder;
  },

  // Update order status (seller action)
  async updateStatus(
    orderId: string,
    status: DbOrder['status'],
    sellerId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('seller_id', sellerId);
    return !error;
  },
};

function getEstimatedDelivery(): string {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
