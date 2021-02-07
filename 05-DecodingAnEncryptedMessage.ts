// FADA448B4A87E900B4761E0189586A73ECF72FE44F0EEC4B54CC0429EDDB4E0F

import { map } from "rxjs/operators";
import {
  Account,
  NetworkType,
  PublicAccount,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransferTransaction,
} from "symbol-sdk";

const networkType = NetworkType.TEST_NET;

// 読み取りてのアカウントを秘密鍵から作成
const certificatePrivateKey =
  "28C97C774A7C72BA6A1E6B89EF127A773B6EFA88CF6610E7162E1A66ECFBB1E4";
const certificateAccount = Account.createFromPrivateKey(
  certificatePrivateKey,
  networkType
);

// 送信側のアカウントを公開鍵から作成
const testnet4PublicKey =
  "5B1D8546905F6299E95F7B03B1D29AD0586D7615FB4BB14B5B1AA8E49FC6164F";
const testnet4PublicAccount = PublicAccount.createFromPublicKey(
  testnet4PublicKey,
  networkType
);

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();
const transactionHash =
  "B64D2715DFAD2819F122911D15CAD1DE58C5956D4BC69BE27CAEEE4205503FDB";

transactionHttp
  .getTransaction(transactionHash, TransactionGroup.Confirmed)
  .pipe(map((x) => x as TransferTransaction))
  .subscribe(
    (transaction) => {
      console.log("Raw message: ", transaction.message.payload);
      console.log(
        "Message: ",
        certificateAccount.decryptMessage(
          transaction.message,
          testnet4PublicAccount
        ).payload
      );
    },
    (err) => console.log(err)
  );
