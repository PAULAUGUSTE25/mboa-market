export interface RegisterRequest {
  phone: string;
  password: string;
  email?: string;
  profile: {
    display_name: string;
    activity_type: 'producer' | 'buyer' | 'seed_provider';
    region: string;
    locality?: string;
    bio?: string;
  };
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  profile?: UserProfile;
}

export interface UserProfile {
  display_name: string;
  activity_type: 'producer' | 'buyer' | 'seed_provider';
  domain?: 'agriculture' | 'elevage';
  region: string;
  locality?: string;
  bio?: string;
}
