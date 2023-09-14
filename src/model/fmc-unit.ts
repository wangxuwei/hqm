import { DueDateInfo } from '../bindings/DueDateInfo.js';
import { InterestInfo } from '../bindings/InterestInfo.js';
import { LeftIncomeInfo } from '../bindings/LeftIncomeInfo.js';
import { PaymentInfo } from '../bindings/PaymentInfo.js';
import { Unit, UnitForCreate, UnitForUpdate } from '../bindings/index.js';
import { ipc_invoke } from '../ts/ipc.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitFmc
class UnitFmc extends BaseFmc<Unit, UnitForCreate, UnitForUpdate> {
  constructor() {
    super("unit");
  }

  async listUnits(): Promise<Unit[]> {
    return ipc_invoke(`list_units`, {}).then(res => {
      return res.data as unknown as Unit[];
    });
  }

  async importUnits(path: string) {
    return ipc_invoke(`import_units`, { path });
  }

  async exportUnits(path: string) {
    return ipc_invoke(`export_units`, { path });
  }

  async backupUnits() {
    return ipc_invoke(`backup_units`, {});
  }

  async restoreUnits() {
    return ipc_invoke(`restore_units`, {});
  }

  async getPaymentInPeriod(start_date?: string, end_date?: string): Promise<PaymentInfo> {
    return ipc_invoke(`get_payment_in_period`, { start_date, end_date }).then(res => {
      return res.data as unknown as PaymentInfo;
    });
  }

  async getValidLeftIncome(start_date?: string, end_date?: string): Promise<LeftIncomeInfo> {
    return ipc_invoke(`get_valid_left_income`, { start_date, end_date }).then(res => {
      return res.data as unknown as LeftIncomeInfo;
    });
  }

  async getDueDateUnitsInPeroid(start_date?: string, end_date?: string): Promise<DueDateInfo> {
    return ipc_invoke(`get_due_date_units_in_peroid`, { start_date, end_date }).then(res => {
      return res.data as unknown as DueDateInfo;
    });
  }


  async getInterestInPeriod(start_date?: string, end_date?: string): Promise<InterestInfo> {
    return ipc_invoke(`get_interest_in_period`, { start_date, end_date }).then(res => {
      return res.data as unknown as InterestInfo;
    });
  }

}

export const unitFmc = new UnitFmc();
// #endregion --- UnitFmc
