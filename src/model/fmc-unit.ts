import { Unit, UnitForCreate, UnitForUpdate } from '../bindings/index.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitFmc
class UnitFmc extends BaseFmc<Unit, UnitForCreate, UnitForUpdate> {
  constructor() {
    super("unit");
  }
}
export const unitFmc = new UnitFmc();
// #endregion --- UnitFmc
