export type AuthUser = {
  id: string;
  name: string;
  email: string;
  storageQuota?: number;
  createdAt?: string;
  deletedAt?: string | null;
};

export type UserProfile = AuthUser & {
  storageQuota: number;
  createdAt: string;
  deletedAt: string | null;
};

export type Credentials = {
  email: string;
  password: string;
};

export type RegistrationInput = Credentials & {
  name: string;
};

export type UpdateUserInput = Pick<RegistrationInput, "name" | "email">;
