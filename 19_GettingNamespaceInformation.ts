import {NamespaceId, RepositoryFactoryHttp} from 'symbol-sdk';

const namespaceId = new NamespaceId('kazumasa.kazumasa009');
const nodeUrl = "http://52.25.53.38:3000";
const repositoryFactory = new RepositoryFactoryHttp(nodeUrl);
const namespaceHttp = repositoryFactory.createNamespaceRepository();

namespaceHttp.getNamespace(namespaceId).subscribe(
  (namespaceInfo) => console.log(namespaceInfo),
  (err) => console.error(err),
);
