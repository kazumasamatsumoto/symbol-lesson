// hash 6CE310CE48338BB55F593DB1149C403B3F9EF380A8390D681D3F4A50B27C0027

import {
  Metadata,
  MetadataType,
  NamespaceId,
  Page,
  RepositoryFactoryHttp,
} from "symbol-sdk";

const namespaceId = new NamespaceId("kazumasa");

const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const metadataHttp = repositoryFactory.createMetadataRepository();

const searchCriteria = {
  targetId: namespaceId,
  metadataType: MetadataType.Namespace,
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
      console.log("\n The namespace does not have metadata entries assigned");
    }
  },
  (err) => console.log(err)
);
