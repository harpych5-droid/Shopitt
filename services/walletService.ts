import { supabase } from '@/lib/supabase';
import { DbWalletTransaction } from '@/lib/types';

export const WalletService = {
  async getBalance(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    return (data as any)?.wallet_balance || 0;
  },

  async getTransactions(userId: string): Promise<DbWalletTransaction[]> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as DbWalletTransaction[];
  },

  async requestWithdrawal(userId: string, amount: number, description: string): Promise<boolean> {
    const balance = await WalletService.getBalance(userId);
    if (amount > balance) return false;

    const { error } = await supabase.from('wallet_transactions').insert({
      user_id: userId,
      type: 'withdrawal',
      amount: -amount,
      description,
      status: 'pending',
    });
    if (error) return false;

    // Deduct balance
    await supabase.from('user_profiles').update({
      wallet_balance: balance - amount,
    }).eq('id', userId);

    // Insert courier API call placeholder comment:
    // Insert payment gateway API here — e.g. MTN Mobile Money, Airtel Money
    // const response = await fetch('https://payment-gateway.example.com/payout', { ... });

    return true;
  },

  async getTotalEarnings(userId: string): Promise<number> {
    const { data } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'credit');
    return ((data || []) as any[]).reduce((sum, t) => sum + (t.amount || 0), 0);
  },
};
