// interface Env {
//   ASSETS: Fetcher;
// }

// export default {
//   fetch(request, _env) {
//     const url = new URL(request.url);

//     if (url.pathname.startsWith("/api/")) {
//       return Response.json({
//         name: "Cloudflare",
//       });
//     }

//     return new Response(null, { status: 404 });
//   },
// } satisfies ExportedHandler<Env>;

import app from "gendless-api-worker";
export default app;
