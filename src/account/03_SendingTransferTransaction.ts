import { ADDRESS, PRIVATEKEY } from "./../accountConfig";
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
  const nodeUrl = "http://api-01.us-east-1.testnet.symboldev.network:3000";
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  // symbolの時間軸と現世の時間軸の調整をする
  const epochAdjustment = await repositoryFactory
    .getEpochAdjustment()
    .toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const networkGenerationHash = await repositoryFactory
    .getGenerationHash()
    .toPromise();
  // {}は分割代入と言ってオブジェクトの値から欲しい値だけを取り出すことができる
  const { currency } = await repositoryFactory.getCurrencies().toPromise();

  const rawAddress = "TB6Q5E-YACWBP-CXKGIL-I6XWCH-DRFLTB-KUK34I-YJQ";
  const recipientAddress = Address.createFromRawAddress(rawAddress);

  const transferTransaction = TransferTransaction.create(
    Deadline.create(epochAdjustment),
    recipientAddress,
    [currency.createRelative(10)],
    PlainMessage.create("This is a test message"),
    networkType,
    UInt64.fromUint(2000000)
  );

  const privateKey = PRIVATEKEY;
  const account = Account.createFromPrivateKey(privateKey, networkType);
  const signedTransaction = account.sign(
    transferTransaction,
    networkGenerationHash
  );

  const transactionRepository = repositoryFactory.createTransactionRepository();
  const response = await transactionRepository
    .announce(signedTransaction)
    .toPromise();
  console.log(response);
};

example().then();
