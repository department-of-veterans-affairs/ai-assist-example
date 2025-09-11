export interface VistaId {
  site_id: string;
  site_name: string;
  duz: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  vista_ids: VistaId[];
}

export interface CurrentUser {
  authenticated: boolean;
  user_info: UserInfo | null;
}
