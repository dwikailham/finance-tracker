import type { Category } from "./category.types";

export type BudgetStatus = "safe" | "warning" | "over";

export interface BudgetItem {
  id: string;
  categoryId: string | null;
  category: Pick<Category, "id" | "name" | "icon" | "color" | "type"> | null;
  month: number;
  year: number;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentage: number;
  status: BudgetStatus;
  categories: BudgetItem[];
}

export interface CreateBudgetPayload {
  categoryId: string | null;
  month: number;
  year: number;
  amount: number;
}

export interface CopyBudgetPayload {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}
