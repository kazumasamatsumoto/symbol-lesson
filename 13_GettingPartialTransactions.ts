import { Address, RepositoryFactoryHttp, TransactionGroup } from "symbol-sdk";

const rawAddress = 'TD6R2O-SMRAXK-PNAFXU-33SQAJ-IYQC3T-AYB642-2GA';
const address = Address.createFromRawAddress(rawAddress);
const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

const searchCriteria = {
  group: TransactionGroup.Partial,
  address,
  pageNumber: 1,
  pageSize: 100,
};

transactionHttp.search(searchCriteria).subscribe(
  (page) => console.log(page.data),
  (err) => console.error(err),
);

// Aggregate Transaction Hash:  58266CEAD0EDDBD2598E5D20D06844C34FDFF98E4E2C2E204E92C03818FA9B0D
