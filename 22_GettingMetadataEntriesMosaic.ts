// hash F89C6BF9FC6FFD6DD51D483A38F8A5DFCD7B2728674E16E9F3219B3041575406

import {
  Metadata,
  MetadataType,
  MosaicId,
  Page,
  RepositoryFactoryHttp,
} from "symbol-sdk";

const mosaicIdHex = "56D7890976B67B14";
const mosaicId = new MosaicId(mosaicIdHex);

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const metadataHttp = repositoryFactory.createMetadataRepository();

const searchCriteria = {
  targetId: mosaicId,
  metadataType: MetadataType.Mosaic,
};
metadataHttp.search(searchCriteria).subscribe(
  (metadataEntries: Page<Metadata>) => {
    if (metadataEntries.pageSize > 0) {
      console.log("Page", metadataEntries.pageNumber);
      metadataEntries.data.map((entry: Metadata) => {
        const metadataEntry = entry.metadataEntry;
        console.log("\n \n Key:\t", metadataEntry.scopedMetadataKey);
        console.log("\n ---");
        console.log("\n Value:\t", metadataEntry.value);
        console.log(
          "\n Sender Address:\t",
          metadataEntry.sourceAddress.pretty()
        );
        console.log(
          "\n Target address:\t",
          metadataEntry.targetAddress.pretty()
        );
        console.log(
          "\n Scoped metadata key:\t",
          metadataEntry.scopedMetadataKey.toHex()
        );
        console.log("\n TargetId:\t", metadataEntry.targetId);
      });
    } else {
      console.log("\n The mosaic does not have metadata entries assigned.");
    }
  },
  (err) => console.log(err)
);
