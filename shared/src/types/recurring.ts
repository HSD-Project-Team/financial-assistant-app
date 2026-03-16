import { Category } from './category';

export interface RecurringTransaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionRequest {
  categoryId: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
}

export interface UpdateRecurringTransactionRequest {
  categoryId?: string;
  title?: string;
  amount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isActive?: boolean;
}