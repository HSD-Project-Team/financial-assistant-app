export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  bgColor: string;
  isSystem: boolean;
  userId: string | null;
  parentId: string | null;
  createdAt: string;
  children?: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  bgColor: string;
  parentId?: string;
}