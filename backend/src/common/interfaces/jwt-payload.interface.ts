export interface JwtPayload {
  sub: string;        // User ID
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roles: string[];    // Role names array
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
