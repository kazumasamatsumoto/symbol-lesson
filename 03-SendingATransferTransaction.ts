import {
  Account,
  Address,
  Deadline,
  PlainMessage,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {

  // network 環境設定
  const nodeUrl = "http://52.25.53.38:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  // symbolのネットワークの時間と現在時間を合わせる
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();
  const { currency } = await repositoryFactory.getCurrencies().toPromise();

  // 受け取り側の情報
  const rawAddress = 'TC4FLK-B2FTKW-6TTOID-7JZSAM-UMGIT2-SSLCH5-QUI';
  const recipientAddress = Address.createFromRawAddress(rawAddress);

  // トランザクションの中身
  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    recipientAddress,
    [currency.createRelative(10)],
    PlainMessage.create('This is a test message'),
    networkType,
    UInt64.fromUint(2000000),
  );

  const privateKey = 'A4AD1EC2605BA2797172E140C2771D24F317039DD8D3CBCA6F117059F0031270';
  const account = Account.createFromPrivateKey(privateKey, networkType);
  const signedTransaction = account.sign(
    transferTransaction,
    networkGenerationHash,
  );
  console.log('Payload:', signedTransaction.payload);
  console.log('Transaction Hash:', signedTransaction.hash);

  const transactionRepository = repositoryFactory.createTransactionRepository();
  const response = await transactionRepository.announce(signedTransaction).toPromise();
  console.log(response);
};


example().then();
