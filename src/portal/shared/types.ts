export interface JwtPayload {
  user_id: number;
  email: string;
  role: string | null;
  exp: number;
}
