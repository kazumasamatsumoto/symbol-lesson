// 承認済のトランザクション履歴を作成する時に使える

import { Address, RepositoryFactoryHttp, TransactionGroup } from "symbol-sdk";
import { ADDRESS } from "../accountConfig";

const rawAddress = ADDRESS;
const address = Address.createFromRawAddress(rawAddress);

const nodeUrl = 'http://api-01.us-east-1.testnet.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

const searchCriteria = {
  group: TransactionGroup.Confirmed,
  address,
  pageNumber: 1,
  pageSize: 100,
};
transactionHttp.search(searchCriteria).subscribe(
  (page) => console.log(page.data),
  (err) => console.error(err),
);
