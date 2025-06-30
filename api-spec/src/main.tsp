import "@typespec/http";

using Http;
@service(#{ title: "Gendless" })
namespace Gendless;

model VersionModel {
  version: string;
}

@route("/version")
@tag("version")
interface Version {
  @get get(): VersionModel
}