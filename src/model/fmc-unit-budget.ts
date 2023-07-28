import { UnitBudget, UnitBudgetForCreate, UnitBudgetForUpdate } from '../bindings/index.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitBudgetFmc
class UnitBudgetFmc extends BaseFmc<UnitBudget, UnitBudgetForCreate, UnitBudgetForUpdate> {
  constructor() {
    super("UnitBudget");
  }

}
export const unitBudgetFmc = new UnitBudgetFmc();
// #endregion --- UnitBudgetFmc
