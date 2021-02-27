import { map, mergeMap } from "rxjs/operators";
import {
  Account,
  AggregateTransaction,
  CosignatureSignedTransaction,
  CosignatureTransaction,
  NetworkType,
  RepositoryFactoryHttp,
  TransactionGroup,
} from "symbol-sdk";

const cosignAggregateBondedTransaction = (
  transaction: AggregateTransaction,
  account: Account
): CosignatureSignedTransaction => {
  const cosignatureTransaction = CosignatureTransaction.create(transaction);
  return account.signCosignatureTransaction(cosignatureTransaction);
};

const networkType = NetworkType.TEST_NET;
const privateKey =
  "3BA5AFC5B709175A4D4D73829CBAD274DC227B9E39E5F159BE3D6DA5E3CAD648";
const account = Account.createFromPrivateKey(privateKey, networkType);
const transactionHash =
  "58266CEAD0EDDBD2598E5D20D06844C34FDFF98E4E2C2E204E92C03818FA9B0D";

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

transactionHttp
  .getTransaction(transactionHash, TransactionGroup.Partial)
  .pipe(
    map((transaction) =>
      cosignAggregateBondedTransaction(
        transaction as AggregateTransaction,
        account
      )
    ),
    mergeMap((CosignatureSignedTransaction) =>
      transactionHttp.announceAggregateBondedCosignature(
        CosignatureSignedTransaction
      )
    )
  )
  .subscribe(
    (announcedTransaction) => console.log(announcedTransaction),
    (err) => console.error(err)
  );
