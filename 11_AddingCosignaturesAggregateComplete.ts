import {
  Account,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  NetworkCurrencies,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionMapping,
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

  const bobPublicKey =
    "AF9447D65888D37EFDB55D4D4FDFC286DEC3EFA91A70338225FB23A7724AE843";
  const bobPublicAccount = PublicAccount.createFromPublicKey(
    bobPublicKey,
    networkType
  );

  const aliceTransferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    bobPublicAccount.address,
    [NetworkCurrencies.PUBLIC.currency.createRelative(1000)],
    PlainMessage.create("payout"),
    networkType
  );

  const bobTransferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    aliceAccount.address,
    [new Mosaic(new MosaicId("4313D5FF414ACD13"), UInt64.fromUint(100))],
    PlainMessage.create("payout"),
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      aliceTransferTransaction.toAggregate(aliceAccount.publicAccount),
      bobTransferTransaction.toAggregate(bobPublicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  const generationHash =
    "45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD";

  const signedTransactionNotComplete = aliceAccount.sign(
    aggregateTransaction,
    generationHash
  );

  console.log(signedTransactionNotComplete.payload);

  const bobPrivateKey =
    "3BA5AFC5B709175A4D4D73829CBAD274DC227B9E39E5F159BE3D6DA5E3CAD648";
  const bobAccount = Account.createFromPrivateKey(bobPrivateKey, networkType);
  const cosignedTransactionBob = CosignatureTransaction.signTransactionPayload(
    bobAccount,
    signedTransactionNotComplete.payload,
    generationHash
  );
  console.log(cosignedTransactionBob.signature);
  console.log(cosignedTransactionBob.parentHash);

  const cosignatureSignedTransactions = [
    new CosignatureSignedTransaction(
      cosignedTransactionBob.parentHash,
      cosignedTransactionBob.signature,
      cosignedTransactionBob.signerPublicKey
    ),
  ];

  const rectreatedAggregateTransactionFromPayload = TransactionMapping.createFromPayload(
    signedTransactionNotComplete.payload
  ) as AggregateTransaction;

  const signedTransactionComplete = aliceAccount.signTransactionGivenSignatures(
    rectreatedAggregateTransactionFromPayload,
    cosignatureSignedTransactions,
    generationHash
  );

  console.log(signedTransactionComplete.hash);

  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransactionComplete).subscribe(
    (x) => console.log(x),
    (err) => console.error(err),
  );
};

example().then();
