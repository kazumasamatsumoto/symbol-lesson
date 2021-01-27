import { PRIVATEKEY } from '../accountConfig';
import { Account, NetworkType } from "symbol-sdk";
const privateKey = PRIVATEKEY;

const account = Account.createFromPrivateKey(privateKey, NetworkType.TEST_NET);
console.log(
"秘密鍵からアカウントを取得する",
"Your account address is:",
account.address.pretty(),
"and its private key",
account.privateKey
);
