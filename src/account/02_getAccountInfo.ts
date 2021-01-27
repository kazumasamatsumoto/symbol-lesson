import { ADDRESS } from "../accountConfig";
import { Address, RepositoryFactoryHttp } from "symbol-sdk";

// アカウントの情報を取得する
const rawAddress = ADDRESS;
const address = Address.createFromRawAddress(rawAddress);

const nodeUrl = "http://54.248.42.181:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const accountHttp = repositoryFactory.createAccountRepository();

accountHttp.getAccountInfo(address).subscribe(
  (accountInfo) => console.log(accountInfo),
  (err) => console.error(err)
);
