import {
  Account,
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

  const alicePrivateKey =
    "5A622285E28524999DD32D5F46DAE2DB252DEF6268A166AA8506C6CE0E1AF921";
  const aliceAccount = Account.createFromPrivateKey(
    alicePrivateKey,
    networkType
  );
  const ticketDistributorPublicKey =
    "AF9447D65888D37EFDB55D4D4FDFC286DEC3EFA91A70338225FB23A7724AE843";
  const ticketDistributorPublicAccount = PublicAccount.createFromPublicKey(
    ticketDistributorPublicKey,
    networkType
  );
  const ticketMosaicId = new MosaicId("4313D5FF414ACD13");
  const ticketDivisibility = 0;
  const networkCurrencyMosaicId = new MosaicId("2CF403E85507F39E");
  const networkCurrencyDivisibility = 6;

  const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    ticketDistributorPublicAccount.address,
    [
      new Mosaic(
        networkCurrencyMosaicId,
        UInt64.fromUint(100 * Math.pow(10, networkCurrencyDivisibility))
      ),
    ],
    PlainMessage.create("send 100 symbol.xym to distributor"),
    networkType
  );

  const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    aliceAccount.address,
    [
      new Mosaic(
        ticketMosaicId,
        UInt64.fromUint(1 * Math.pow(10, ticketDivisibility))
      ),
    ],
    PlainMessage.create("send 1 museum ticket to customer"),
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createBonded(
    Deadline.create(epochAdjustment),
    [
      aliceToTicketDistributorTx.toAggregate(aliceAccount.publicAccount),
      ticketDistributorToAliceTx.toAggregate(ticketDistributorPublicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  const networkGenerationHash =
    "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD";

  const signedTransaction = aliceAccount.sign(
    aggregateTransaction,
    networkGenerationHash
  );

  console.log("Aggregate Transaction Hash: ", signedTransaction.hash);

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

  const signedHashLockTransaction = aliceAccount.sign(
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

// 8,990.407
// 8,978.407
