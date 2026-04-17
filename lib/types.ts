// Database types for Shopitt

export interface DbProfile {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
  display_name: string | null;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  sold_count: number;
  rating: number;
  is_seller: boolean;
  wallet_balance: number;
}

export interface DbPost {
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
  // joined
  user_profiles?: DbProfile;
}

export interface DbComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  text: string;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  user_profiles?: DbProfile;
  replies?: DbComment[];
}

export interface DbOrder {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  post_id: string | null;
  items: OrderItem[];
  delivery_address: DeliveryAddress | null;
  payment_method: 'mobilemoney' | 'card' | 'delivery';
  subtotal: number;
  total: number;
  currency: string;
  status: 'new' | 'pending' | 'confirmed' | 'shipped' | 'delivered';
  delivery_type: string;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  buyer?: DbProfile;
  seller?: DbProfile;
}

export interface OrderItem {
  post_id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  notes?: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
  sender?: DbProfile;
}

export interface DbConversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message: string | null;
  last_message_at: string;
  unread_1: number;
  unread_2: number;
  created_at: string;
  other_user?: DbProfile;
}

export interface DbNotification {
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

export interface DbFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface DbWalletTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'withdrawal' | 'commission';
  amount: number;
  description: string | null;
  order_id: string | null;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}
