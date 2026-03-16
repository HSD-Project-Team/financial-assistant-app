import { Category } from './category';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  title: string | null;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  categoryId: string;
  title?: string;
  amount: number;
  type: 'income' | 'expense';
  date?: string;
  note?: string;
}

export interface UpdateTransactionRequest {
  categoryId?: string;
  title?: string;
  amount?: number;
  type?: 'income' | 'expense';
  date?: string;
  note?: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}