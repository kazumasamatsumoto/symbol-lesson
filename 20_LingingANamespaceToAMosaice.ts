import {
  Account,
  AliasAction,
  AliasTransaction,
  Deadline,
  MosaicId,
  NamespaceId,
  NetworkType,
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
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();
  const namespaceId = new NamespaceId("kazumasa.kazumasa009");
  const mosaicId = new MosaicId("56D7890976B67B14");

  const mosaicAliasTransaction = AliasTransaction.createForMosaic(
    Deadline.create(epochAdjustment),
    AliasAction.Link,
    namespaceId,
    mosaicId,
    networkType,
    UInt64.fromUint(2000000)
  );

  const privateKey =
    "5A622285E28524999DD32D5F46DAE2DB252DEF6268A166AA8506C6CE0E1AF921";
  const account = Account.createFromPrivateKey(privateKey, networkType);
  const signedTransaction = account.sign(
    mosaicAliasTransaction,
    networkGenerationHash
  );

  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err),
  );
};

example().then();
