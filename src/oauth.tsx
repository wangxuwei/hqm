import { emit } from '@tauri-apps/api/event';
import { wait } from 'utils-min';
import { AccessConf } from './bindings/AccessConf';
import { oauthAccessFmc } from './model/fmc-oauth';
import { qsParse } from './ts/querystring';

document.addEventListener("DOMContentLoaded", async function (event) {
	const values = qsParse(window.location.hash.slice(1));

	const oauthAccess = await oauthAccessFmc.storeAccessToken({
		access_token: values.access_token,
		expires_in: parseInt(values.expires_in as string)
	} as unknown as AccessConf);
	await wait(1000);
	emit("SEND_OAUTH_TOKEN", {oauth: oauthAccess});
});