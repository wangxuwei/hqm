import { DueDateInfo } from '../bindings/DueDateInfo.js';
import { InterestInfo } from '../bindings/InterestInfo.js';
import { LeftIncomeInfo } from '../bindings/LeftIncomeInfo.js';
import { PaymentInfo } from '../bindings/PaymentInfo.js';
import { Unit, UnitForCreate, UnitForUpdate } from '../bindings/index.js';
import { ensure_ModelMutateResultData } from '../bindings/type_asserts.js';
import { ipc_invoke } from '../ts/ipc.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitFmc
class UnitFmc extends BaseFmc<Unit, UnitForCreate, UnitForUpdate> {
  constructor() {
    super("unit");
  }

  async getPaymentInPeriod(startDate?: string, endDate?: string): Promise<PaymentInfo> {
    return ipc_invoke(`get_payment_in_period`, { startDate, endDate }).then(res => {
      return ensure_ModelMutateResultData(res.data) as unknown as PaymentInfo;
    });
  }

  async getValidLeftIncome(startDate?: string, endDate?: string): Promise<LeftIncomeInfo> {
    return ipc_invoke(`get_valid_left_income`, { startDate, endDate }).then(res => {
      return ensure_ModelMutateResultData(res.data) as unknown as LeftIncomeInfo;
    });
  }

  async getDueDateUnitsInPeroid(startDate?: string, endDate?: string): Promise<DueDateInfo> {
    return ipc_invoke(`get_due_date_units_in_peroid`, { startDate, endDate }).then(res => {
      return ensure_ModelMutateResultData(res.data) as unknown as DueDateInfo;
    });
  }


  async getInterestInPeriod(startDate?: string, endDate?: string): Promise<InterestInfo> {
    return ipc_invoke(`get_interest_in_period`, { startDate, endDate }).then(res => {
      return ensure_ModelMutateResultData(res.data) as unknown as InterestInfo;
    });
  }

}
export const unitFmc = new UnitFmc();
// #endregion --- UnitFmc
