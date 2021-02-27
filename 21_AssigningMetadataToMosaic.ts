import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  MosaicMetadataTransaction,
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

  const companyPrivateKey = '5A622285E28524999DD32D5F46DAE2DB252DEF6268A166AA8506C6CE0E1AF921';
  const companyAccount = Account.createFromPrivateKey(companyPrivateKey, networkType);

  const mosaicId = new NamespaceId('kazumasa.kazumasa009');

  const isin = 'US00000000';
  const isinMetadataTransaction = MosaicMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key('ISIN'),
    mosaicId,
    isin.length,
    isin,
    networkType,
  );

  const name = 'BenjaminInc';
  const nameMetadataTransaction = MosaicMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key('NAME'),
    mosaicId,
    name.length,
    name,
    networkType,
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      isinMetadataTransaction.toAggregate(companyAccount.publicAccount),
      nameMetadataTransaction.toAggregate(companyAccount.publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000),
  );

  const signedTransaction = companyAccount.sign(
    aggregateTransaction,
    networkGenerationHash,
  );
  console.log(signedTransaction.hash);

  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err),
  );
}

example().then();
