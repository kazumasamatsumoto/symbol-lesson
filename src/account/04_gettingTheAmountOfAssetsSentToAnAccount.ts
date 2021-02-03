// 指定したアカウントへどれだけ送金したかがわかる。誰に貢いだかを把握するためのリスト
import { PUBLICKEY, ADDRESS } from '../accountConfig';
import { filter, map, mergeMap, toArray } from "rxjs/operators";
import {
  Address,
  MosaicId,
  RepositoryFactoryHttp,
  TransactionGroup,
  TransactionType,
  TransferTransaction,
} from "symbol-sdk";

const signerPublicKey = PUBLICKEY;

const recipientRowAddress = "TB6Q5E-YACWBP-CXKGIL-I6XWCH-DRFLTB-KUK34I-YJQ";
const recipientAddress = Address.createFromRawAddress(recipientRowAddress);

const mosaicIdHex = '2CF403E85507F39E';

const divisibility = 6;
const mosaicId = new MosaicId(mosaicIdHex);

const nodeUrl = 'http://api-01.us-east-1.testnet.symboldev.network:3000';
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const transactionHttp = repositoryFactory.createTransactionRepository();

const searchCriteria = {
  group: TransactionGroup.Confirmed,
  signerPublicKey,
  recipientAddress,
  pageSize: 100,
  pageNumber: 1,
  type: [TransactionType.TRANSFER],
};

transactionHttp
  .search(searchCriteria)
  .pipe(
    map((_) => _.data),
    mergeMap((_) => _),
    map((_) => _ as TransferTransaction),
    filter((_) => _.mosaics.length === 1 && _.mosaics[0].id.equals(mosaicId)),
    map((_) => _.mosaics[0].amount.compact() / Math.pow(10, divisibility)),
    toArray(),
    map((_) => _.reduce((a, b) => a + b, 0)),
  )
  .subscribe(
    (total) => console.log(total),
    (err) => console.error(err)
  );
