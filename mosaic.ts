// 661F03AC5A115659 モザイクID
// TAGK4O-WDA4JH-KGCH2Y-6YQXW3-CRGKBG-6TVOVR-SMQ チケット発行者のアドレス
// 5B1D8546905F6299E95F7B03B1D29AD0586D7615FB4BB14B5B1AA8E49FC6164F チケット発行者の公開鍵
// A4AD1EC2605BA2797172E140C2771D24F317039DD8D3CBCA6F117059F0031270 チケット発行者の秘密鍵
// TC4FLK-B2FTKW-6TTOID-7JZSAM-UMGIT2-SSLCH5-QUI ユーザーのアドレス
// GenerationHash 45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD

import {
  Account,
  Address,
  Deadline,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const epochAdjustment = 123456789;

const mosaicIdHex = "2CF403E85507F39E";
const mosaicId = new MosaicId(mosaicIdHex);
const rawAddress = "TC4FLK-B2FTKW-6TTOID-7JZSAM-UMGIT2-SSLCH5-QUI";
const recipientAddress = Address.createFromRawAddress(rawAddress);
const networkType = NetworkType.TEST_NET;

const transferTransaction = TransferTransaction.create(
  Deadline.create(epochAdjustment),
  recipientAddress,
  [new Mosaic(mosaicId, UInt64.fromUint(100))],
  PlainMessage.create("enjoy your ticket"),
  networkType,
  UInt64.fromUint(2000000)
);

const privateKey =
  "A4AD1EC2605BA2797172E140C2771D24F317039DD8D3CBCA6F117059F0031270";
const account = Account.createFromPrivateKey(privateKey, networkType);
const networkGenerationHash =
  "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD";
const signedTransaction = account.sign(
  transferTransaction,
  networkGenerationHash
);

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);

const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp.announce(signedTransaction).subscribe(
  (x) => console.log(x),
  (err) => console.error(err)
);
