import { Account, NetworkType } from 'symbol-sdk';

const privateKey = 'A4AD1EC2605BA2797172E140C2771D24F317039DD8D3CBCA6F117059F0031270';

const account = Account.createFromPrivateKey(privateKey, NetworkType.TEST_NET);

console.log(account.address.pretty());
console.log(account.privateKey);
