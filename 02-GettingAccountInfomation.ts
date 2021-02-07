import { Address, RepositoryFactoryHttp } from "symbol-sdk";

const rawAddress = "TAGK4O-WDA4JH-KGCH2Y-6YQXW3-CRGKBG-6TVOVR-SMQ";
const address = Address.createFromRawAddress(rawAddress);

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactoryHttp = new RepositoryFactoryHttp(nodeUrl);
const accountHttp = repositoryFactoryHttp.createAccountRepository();

accountHttp.getAccountInfo(address).subscribe(
  (accountInfo) => console.log(accountInfo),
  (err) => console.error(err)
);
