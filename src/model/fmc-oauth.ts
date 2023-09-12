import { AccessConf } from '../bindings/AccessConf.js';
import { OAuthAccess } from '../bindings/OAuthAccess.js';
import { OAuthAccessForCreate } from '../bindings/OAuthAccessForCreate.js';
import { OAuthAccessForUpdate } from '../bindings/OAuthAccessForUpdate.js';
import { ipc_invoke } from '../ts/ipc.js';
import { BaseFmc } from './fmc-base.js';

// #region    --- UnitFmc
class OAuthAccessFmc extends BaseFmc<OAuthAccess, OAuthAccessForCreate, OAuthAccessForUpdate> {
  constructor() {
    super("oauth_access");
  }

  async storeAccessToken(accessConf: AccessConf) {
    return ipc_invoke(`store_access_token`, { data: accessConf }).then(res => {
      return res.data as unknown as OAuthAccess;
    });
  }

}

export const oauthAccessFmc = new OAuthAccessFmc();
// #endregion --- UnitFmc
