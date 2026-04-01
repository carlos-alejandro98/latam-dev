export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
  /** Full display name extracted from the id_token (given_name + family_name) */
  userName?: string;
  /** Base64 data URL of the user profile photo fetched from Microsoft Graph */
  userPhotoUrl?: string;
}
