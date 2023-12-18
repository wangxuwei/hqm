import { UnitBudget, UnitBudgetForCreate, UnitBudgetForUpdate } from '../bindings/index.js';
import { ipc_invoke } from '../ts/ipc.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitBudgetFmc
class UnitBudgetFmc extends BaseFmc<UnitBudget, UnitBudgetForCreate, UnitBudgetForUpdate> {
  constructor() {
    super("unit_budget");
  }

  async listUnitBudgets(unit_id: string): Promise<UnitBudget[]> {
    return ipc_invoke(`list_unit_budgets`, { unit_id }).then(res => {
      return res.data as unknown as UnitBudget[];
    });
  }
}
export const unitBudgetFmc = new UnitBudgetFmc();
// #endregion --- UnitBudgetFmc
