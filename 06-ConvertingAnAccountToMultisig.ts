import {
  Account,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  MultisigAccountModificationTransaction,
  NetworkType,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionService,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = "http://52.25.53.38:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const { currency } = await repositoryFactory.getCurrencies().toPromise();
  // マルチシグのアカウントのプライベートキーが必要
  const privateKey =
    "04E13BA330DF9940ED62D265FFE9BBDE3D1BBD2E6BD679AD73AD7E339E591477";
  const account = Account.createFromPrivateKey(privateKey, networkType);

  // 連署者1
  const cosignatory1PublicKey =
    "AF9447D65888D37EFDB55D4D4FDFC286DEC3EFA91A70338225FB23A7724AE843";
  const cosignatory1 = PublicAccount.createFromPublicKey(
    cosignatory1PublicKey,
    networkType
  );

  // 連署者2
  const cosignatory2PublicKey =
    "18A65D9DB6533BE630C96CC2D50FBDBAB9713E5DF7E6E064211A786A2FEBB4C3";
  const cosignatory2 = PublicAccount.createFromPublicKey(
    cosignatory2PublicKey,
    networkType
  );

  // マルチシグアカウントに連署者を追加する作業
  const multisigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
    Deadline.create(epochAdjustment),
    1,
    1,
    [cosignatory1.address, cosignatory2.address],
    [],
    networkType
  );

  // アグリゲートトランザクションを作成する
  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [multisigAccountModificationTransaction.toAggregate(account.publicAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  // トランザクションをサインする
  const networkGenerationHash =
    "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD";
  const signedTransaction = account.sign(
    aggregateTransaction,
    networkGenerationHash
  );
  console.log(signedTransaction.hash);

  // ハッシュロックトランザクションのために10xymキープ
  const networkCurrencyMosaicId = new MosaicId("2CF403E85507F39E");
  const networkCurrencyDivisibility = 6;

  const hashLockTransaction = HashLockTransaction.create(
    Deadline.create(epochAdjustment),
    new Mosaic(
      networkCurrencyMosaicId,
      UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
    ),
    UInt64.fromUint(480),
    signedTransaction,
    networkType,
    UInt64.fromUint(2000000)
  );

  const signedHashLockTransaction = account.sign(
    hashLockTransaction,
    networkGenerationHash
  );

  const listener = repositoryFactory.createListener();
  const receiptHttp = repositoryFactory.createReceiptRepository();
  const transactionHttp = repositoryFactory.createTransactionRepository();
  const transactionService = new TransactionService(
    transactionHttp,
    receiptHttp
  );

  listener.open().then(() => {
    transactionService
      .announceHashLockAggregateBonded(
        signedHashLockTransaction,
        signedTransaction,
        listener
      )
      .subscribe(
        (x) => console.log(x),
        (err) => console.log(err),
        () => listener.close()
      );
  });
};

example().then();
