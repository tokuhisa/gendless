import "@typespec/http";
import "@typespec/streams";

using Http;
@service(#{ title: "Gendless" })
namespace Gendless;

model VersionModel {
  version: string;
}

model DocumentModel {
  content: string;
}

@TypeSpec.Streams.streamOf(string)
model ReadDocumentResponse {
  @body body: string;
}

model CreateDocumentModel {
  inputFileName: string;
}

@route("/version")
@tag("version")
namespace Version {
  @get
  op get(): VersionModel;
}

@route("/documents")
@tag("documents")
namespace Documents {
  @post
  op post(@body document: CreateDocumentModel): ReadDocumentResponse;

  namespace DocumentId {
    @get
    op get(@path documentId: string): ReadDocumentResponse;
  }
}
