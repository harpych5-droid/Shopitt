import { supabase } from '@/lib/supabase';
import type { DBWalletTransaction } from '@/lib/types';

export const WalletService = {
  async getBalance(userId: string): Promise<number> {
    const { data } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();
    return (data as any)?.wallet_balance ?? 0;
  },

  async getTransactions(userId: string, limit = 30): Promise<{ data: DBWalletTransaction[]; error: string | null }> {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data: (data as DBWalletTransaction[]) ?? [], error: error?.message ?? null };
  },

  async requestWithdrawal(userId: string, amount: number, provider: string, phone: string): Promise<{ error: string | null }> {
    // Insert payment gateway API here
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const balance = (profile as any)?.wallet_balance ?? 0;
    if (amount > balance) return { error: 'Insufficient balance' };

    const { error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'withdrawal',
        amount: -amount,
        description: `Withdrawal to ${provider} ${phone}`,
        status: 'pending',
      });

    if (!error) {
      await supabase
        .from('user_profiles')
        .update({ wallet_balance: balance - amount })
        .eq('id', userId);
    }

    return { error: error?.message ?? null };
  },

  async getTotalEarnings(userId: string): Promise<{ total: number; thisWeek: number }> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data } = await supabase
      .from('wallet_transactions')
      .select('amount, created_at')
      .eq('user_id', userId)
      .eq('type', 'credit');

    const all = data ?? [];
    const total = all.reduce((s: number, t: any) => s + Math.abs(t.amount), 0);
    const thisWeek = all
      .filter((t: any) => new Date(t.created_at) >= weekAgo)
      .reduce((s: number, t: any) => s + Math.abs(t.amount), 0);

    return { total, thisWeek };
  },

  async getWeeklyRevenue(userId: string): Promise<Array<{ day: string; value: number; label: string }>> {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const result = days.map(d => ({ day: d, value: 0, label: '0' }));

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data } = await supabase
      .from('wallet_transactions')
      .select('amount, created_at')
      .eq('user_id', userId)
      .eq('type', 'credit')
      .gte('created_at', weekAgo.toISOString());

    (data ?? []).forEach((t: any) => {
      const day = new Date(t.created_at).getDay();
      result[day].value += Math.abs(t.amount);
      result[day].label = result[day].value >= 1000
        ? `${(result[day].value / 1000).toFixed(1)}K`
        : String(Math.round(result[day].value));
    });

    return result;
  },
};
