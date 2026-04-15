export type AccountType = "cash" | "bank" | "e_wallet" | "credit_card" | "other";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  icon: string;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  name: string;
  type: AccountType;
  initialBalance: number;
  icon?: string;
  color?: string;
}

export interface UpdateAccountPayload {
  name?: string;
  icon?: string;
  color?: string;
}
