import {
  Account,
  AggregateTransaction,
  Deadline,
  MosaicDefinitionTransaction,
  MosaicFlags,
  MosaicId,
  MosaicNonce,
  MosaicSupplyChangeAction,
  MosaicSupplyChangeTransaction,
  NetworkType,
  RepositoryFactoryHttp,
  UInt64,
} from "symbol-sdk";

const example = async (): Promise<void> => {
  const nodeUrl = 'http://52.25.53.38:3000';
  const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
  const epochAdjustment = await repositoryFactory.getEpochAdjustment().toPromise();
  const networkType = await repositoryFactory.getNetworkType().toPromise();
  const privateKey = '3BA5AFC5B709175A4D4D73829CBAD274DC227B9E39E5F159BE3D6DA5E3CAD648';
  const account = Account.createFromPrivateKey(privateKey, networkType);

  const duration = UInt64.fromUint(0);
  const isSupplyMutable = true;
  const isTransferable = true;
  const isRestrictable = true;
  const divisibility = 0;

  const nonce = MosaicNonce.createRandom();
  const mosaicDefinitionTransaction = MosaicDefinitionTransaction.create(
    Deadline.create(epochAdjustment),
    nonce,
    MosaicId.createFromNonce(nonce, account.address),
    MosaicFlags.create(isSupplyMutable, isTransferable, isRestrictable),
    divisibility,
    duration,
    networkType,
  );

  const delta = 1000000;

  const mosaicSupplyChangeTransaction = MosaicSupplyChangeTransaction.create(
    Deadline.create(epochAdjustment),
    mosaicDefinitionTransaction.mosaicId,
    MosaicSupplyChangeAction.Increase,
    UInt64.fromUint(delta * Math.pow(10, divisibility)),
    networkType,
  );

  const aggregateTransaction = AggregateTransaction.createComplete(
    Deadline.create(epochAdjustment),
    [
      mosaicDefinitionTransaction.toAggregate(account.publicAccount),
      mosaicSupplyChangeTransaction.toAggregate(account.publicAccount),
    ],
    networkType,
    [],
    UInt64.fromUint(2000000),
  );

  const networkGenerationHash = '45FBCF2F0EA36EFA7923C9BC923D6503169651F7FA4EFC46A8EAF5AE09057EBD';
  const signedTransaction = account.sign(
    aggregateTransaction,
    networkGenerationHash,
  );

  const transactionHttp = repositoryFactory.createTransactionRepository();

  transactionHttp.announce(signedTransaction).subscribe(
    (x) => console.log(x),
    (err) => console.error(err),
  );
}

example().then();
