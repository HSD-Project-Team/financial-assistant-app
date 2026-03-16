export interface HealthScore {
  overall: number;
  savingsRate: number;
  budgetAdherence: number;
  debtToIncome: number;
}

export interface DashboardSummary {
  healthScore: HealthScore;
  monthlyBudget: {
    total: number;
    spent: number;
    percentage: number;
  };
  topGoal: Goal | null;
  recentTransactions: Transaction[];
  aiInsight: string | null;
}

import { Goal } from './goal';
import { Transaction } from './transaction';