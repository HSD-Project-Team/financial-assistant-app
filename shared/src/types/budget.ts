import { Category } from './category';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  limitAmount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  categoryId: string;
  limitAmount: number;
  period?: 'weekly' | 'monthly' | 'yearly';
}

export interface UpdateBudgetRequest {
  limitAmount: number;
}

export interface BudgetSummary {
  totalLimit: number;
  totalSpent: number;
  remaining: number;
  budgets: Budget[];
}
