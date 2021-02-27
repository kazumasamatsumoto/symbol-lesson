import {
  Account,
  AggregateTransaction,
  Deadline,
  MultisigAccountModificationTransaction,
  NetworkType,
  PublicAccount,
  RepositoryFactoryHttp,
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

  const multisigAccountPublickey =
    "F89A52BFB65D8BDAB33FBC4FC51714175B5A3D7A2CD197A195E7E422C79D892D";
  const multisigAccount = PublicAccount.createFromPublicKey(
    multisigAccountPublickey,
    networkType
  );

  const multisigAccountModificationTransaction = MultisigAccountModificationTransaction.create(
    Deadline.create(epochAdjustment),
    1,
    0,
    [],
    [],
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [multisigAccountModificationTransaction.toAggregate(multisigAccount)],
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
  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err)
  );
};

example().then();
