export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string) => void;
  logout: () => void;
}
