// daoka 8,384.408  のアカウント（デフォルト）
// shohei 11,095.95 とcustomer 5,510に送金します。

import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = "http://52.25.53.38:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const networkGenerationHash = await repositoryFactory.getGenerationHash().toPromise();

  const privateKey =
    "28C97C774A7C72BA6A1E6B89EF127A773B6EFA88CF6610E7162E1A66ECFBB1E4";
  const account = Account.createFromPrivateKey(privateKey, networkType);

  const aliceAddress = "TD6R2O-SMRAXK-PNAFXU-33SQAJ-IYQC3T-AYB642-2GA";
  const aliceAccount = Address.createFromRawAddress(aliceAddress);

  const bobAddress = "TASQI7-SCCUQC-6ASNS2-ZTE4I2-HWGZMI-GWX5QC-PDY";
  const bobAccount = Address.createFromRawAddress(bobAddress);
  const { currency } = await repositoryFactory.getCurrencies().toPromise();

  const aliceTransferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    aliceAccount,
    [currency.createRelative(500)],
    PlainMessage.create("payout"),
    networkType
  );

  const bobTransferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    bobAccount,
    [currency.createRelative(500)],
    PlainMessage.create("payout"),
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      aliceTransferTransaction.toAggregate(account.publicAccount),
      bobTransferTransaction.toAggregate(account.publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  const signedTransaction = account.sign(
    aggregateTransaction,
    networkGenerationHash
  );

  const transactionHttp = repositoryFactory.createTransactionRepository();
  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err)
  );
}
example().then();


// DAN 1,008,801.839
// daoka 8,886.408
// shohei 11,097.95
