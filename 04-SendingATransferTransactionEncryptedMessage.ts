import {
  Account,
  Deadline,
  PublicAccount,
  RepositoryFactoryHttp,
  TransferTransaction,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = "http://54.248.42.181:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();

  const networkType = await repositoryFactory.getNetworkType().toPromise();

  // 暗号メッセージの送信者の秘密鍵からアカウントを作成する
  const testnet4PrivateKey =
    "A4AD1EC2605BA2797172E140C2771D24F317039DD8D3CBCA6F117059F0031270";
  const testnet4Account = Account.createFromPrivateKey(
    testnet4PrivateKey,
    networkType
  );

  // 暗号メッセージを読み取れるアカウントの公開鍵からアカウントを作成する
  const certificatePublicKey =
    "150C91D5BF79500F8FA2B93073DA275CADFCFE3E0C0B64A4964972D8F98FA265";
  const certificatePublicAccount = PublicAccount.createFromPublicKey(
    certificatePublicKey,
    networkType
  );

  // メッセージを暗号化します
  const encryptedMessage = testnet4Account.encryptMessage(
    "今日の晩ご飯はスシローです。うなぎ100円セール実施中みんなもスシローへいこう！！", // メッセージの内容
    certificatePublicAccount // 読み取りて
  );

  // トランザクションの作成
  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    certificatePublicAccount.address,
    [],
    encryptedMessage,
    networkType,
    UInt64.fromUint(2000000)
  );

  // ジェネレーションハッシュの作成
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();

  // トランザクションに署名
  const signedTransaction = testnet4Account.sign(
    transferTransaction,
    networkGenerationHash
  );
  console.log(signedTransaction.hash);

  const transactionRepository = repositoryFactory.createTransactionRepository();

  const response = await transactionRepository
    .announce(signedTransaction)
    .toPromise();
  console.log(response);
};

example().then();
