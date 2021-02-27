import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  RepositoryFactoryHttp,
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
  // 連署者のプライベートキーからアカウント生成
  const cosignatoryAccount = Account.createFromPrivateKey(
    cosignatoryPrivateKey,
    networkType
  );
  const multisigAccountPublicKey =
    "F89A52BFB65D8BDAB33FBC4FC51714175B5A3D7A2CD197A195E7E422C79D892D";
  // マルチシグアカウントの公開鍵からアカウントを作成
  const multisigAccount = PublicAccount.createFromPublicKey(
    multisigAccountPublicKey,
    networkType
  );
  // 受け取り
  const recipientRawAddress = "TBSM4N-7DTWA4-LP4LG3-7GK5SR-U63DKC-UOQTME-3LQ";
  const recipientAddress = Address.createFromRawAddress(recipientRawAddress);

  // symbol-xymの設定
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
    PlainMessage.create("sending 10 symbol.xym happy Valentine"),
    networkType
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
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
    networkGenerationHash,
  );

  const transactionHttp = repositoryFactory.createTransactionRepository();
  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err),
  );
};

example().then();

// 9,996 multi => 9,986
// 10,000 daoka => 9,998
// 10,000 shohei => 10,000
// 1,008,783.888 default => 1,008,793.888
