export type AuthUser = {
  id: string;
  email?: string;
  isAnonymous: boolean;
};

export interface AuthProvider {
  signIn(): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}