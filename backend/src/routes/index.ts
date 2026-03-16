import { Router } from 'express';

import { authRouter } from './auth.routes';
import { userRouter } from './user.routes';
import { categoryRouter } from './category.routes';
import { transactionRouter } from './transaction.routes';
import { recurringRouter } from './recurring.routes';
import { budgetRouter } from './budget.routes';
import { goalRouter } from './goal.routes';
import { dashboardRouter } from './dashboard.routes';
import { aiRouter } from './ai.routes';

export const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/categories', categoryRouter);
router.use('/transactions', transactionRouter);
router.use('/recurring', recurringRouter);
router.use('/budgets', budgetRouter);
router.use('/goals', goalRouter);
router.use('/dashboard', dashboardRouter);
router.use('/ai', aiRouter);
