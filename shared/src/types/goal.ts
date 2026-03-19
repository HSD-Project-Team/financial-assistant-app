export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate?: string;
  color?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  color?: string;
}

export interface AddFundsRequest {
  amount: number;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  createdAt: string;
}
