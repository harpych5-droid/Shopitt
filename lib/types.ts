// ─── Supabase DB Types ───────────────────────────────────────────────────────

export interface DBProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  verified: boolean;
  is_seller: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  sold_count: number;
  rating: number;
  wallet_balance: number;
  created_at: string;
}

export interface DBPost {
  id: string;
  user_id: string;
  post_type: 'product' | 'video' | 'service';
  drop_title: string | null;
  description: string | null;
  price_text: string | null;
  price_num: number;
  currency: string;
  quantity: number;
  quantity_sold: number;
  category: string | null;
  hashtags: string[];
  media_urls: string[];
  delivery_type: 'local' | 'country' | 'international';
  courier_type: 'self' | 'platform';
  free_delivery: boolean;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  user_profiles?: DBProfile;
}

export interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  text: string;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  user_profiles?: DBProfile;
  replies?: DBComment[];
}

export interface DBOrder {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  post_id: string | null;
  items: OrderItem[];
  delivery_address: DeliveryAddress | null;
  payment_method: string;
  subtotal: number;
  total: number;
  currency: string;
  status: 'new' | 'pending' | 'confirmed' | 'shipped' | 'delivered';
  delivery_type: string;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  buyer?: DBProfile;
  seller?: DBProfile;
  post?: DBPost;
}

export interface OrderItem {
  post_id: string;
  seller_id: string;
  product: string;
  price: string;
  price_num: number;
  quantity: number;
  image: string;
  currency: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
  sender?: DBProfile;
}

export interface DBConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_at: string;
  unread_1: number;
  unread_2: number;
  created_at: string;
  other_user?: DBProfile;
}

export interface DBNotification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'order' | 'message' | 'follow';
  title: string;
  body: string;
  related_id: string | null;
  related_type: string | null;
  read: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface DBWalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'withdrawal' | 'commission';
  amount: number;
  description: string | null;
  order_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface DBFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface DBPostLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface DBPostSave {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface DBAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes: string | null;
  is_default: boolean;
  created_at: string;
}
