import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionService,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = "http://52.25.53.38:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();

  const cosignatoryPrivateKey =
    "5A622285E28524999DD32D5F46DAE2DB252DEF6268A166AA8506C6CE0E1AF921";
  const cosignatoryAccount = Account.createFromPrivateKey(
    cosignatoryPrivateKey,
    networkType
  );

  const multisigAccountPublicKey =
    "F89A52BFB65D8BDAB33FBC4FC51714175B5A3D7A2CD197A195E7E422C79D892D";
  const multisigAccount = PublicAccount.createFromPublicKey(
    multisigAccountPublicKey,
    networkType
  );

  const recipientRawAddress = "TBSM4N-7DTWA4-LP4LG3-7GK5SR-U63DKC-UOQTME-3LQ";
  const recipientAddress = Address.createFromRawAddress(recipientRawAddress);

  const networkCurrencyMosaicId = new MosaicId("2CF403E85507F39E");
  const networkCurrencyDivisibility = 6;

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    recipientAddress,
    [
      new Mosaic(
        networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))
      ),
    ],
    PlainMessage.create("sending 10 symbol.xym happy birthday"),
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [transferTransaction.toAggregate(multisigAccount)],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  const networkGenerationHash =
    "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD";
  const signedTransaction = cosignatoryAccount.sign(
    aggregateTransaction,
    networkGenerationHash
  );
  console.log(signedTransaction.hash);

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

  const signedHashLockTransaction = cosignatoryAccount.sign(
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
        (err) => console.error(err),
        () => listener.close()
      );
  });
};

example().then();

// 9,986 multi
// 10,000 shohei
// 9,996 daoka
// 1,008,793.888 default

// トランザクションハッシュ 483AFB0B58E6BEDAE61A243E0630DF12F39444A9B82E181C6FEC2013DE823162

// マルチシグトランザクション発生時
// 9,984.001 daoka
// マルチシグトランザクションを発生させたアカウントだけ手数料が取られる

// 承認結果
// 9,986 multi => 9,976
// 10,000 shohei == 10,000
// 9,984.001 daoka => 9,992.407
// 1,008,793.888 default => 1,008,803.888



