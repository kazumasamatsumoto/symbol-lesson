import {
  Account,
  AggregateTransaction,
  Deadline,
  KeyGenerator,
  NamespaceId,
  NamespaceMetadataTransaction,
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

  const companyPrivateKey =
    "5A622285E28524999DD32D5F46DAE2DB252DEF6268A166AA8506C6CE0E1AF921";
  const companyAccount = Account.createFromPrivateKey(
    companyPrivateKey,
    networkType
  );

  const namespaceId = new NamespaceId("kazumasa");
  const name = "Benjamin";
  const email = "k.matsumoto@benjamin.co.jp";
  const address = "Edogawaku Ichinoe";
  const phone = "0120-111-111";

  const nameMetadataTransaction = NamespaceMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key("NAME"),
    namespaceId,
    name.length,
    name,
    networkType
  );

  const emailMetadataTransaction = NamespaceMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key("EMAIL"),
    namespaceId,
    email.length,
    email,
    networkType
  );

  const addressMetadataTransaction = NamespaceMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key("ADDRESS"),
    namespaceId,
    address.length,
    address,
    networkType
  );

  const phoneMetadataTransaction = NamespaceMetadataTransaction.create(
    Deadline.create(epochAdjustment),
    companyAccount.address,
    KeyGenerator.generateUInt64Key("PHONE"),
    namespaceId,
    phone.length,
    phone,
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      nameMetadataTransaction.toAggregate(companyAccount.publicAccount),
      emailMetadataTransaction.toAggregate(companyAccount.publicAccount),
      addressMetadataTransaction.toAggregate(companyAccount.publicAccount),
      phoneMetadataTransaction.toAggregate(companyAccount.publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000)
  );

  const signedTransaction = companyAccount.sign(
    aggregateTransaction,
    networkGenerationHash
  );
  console.log(signedTransaction.hash);

  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err)
  );
};

example().then();
