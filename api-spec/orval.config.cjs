module.exports = {
  zod: {
    input: {
      target: "./tsp-output/schema/openapi.json",
    },
    output: {
      client: "zod",
      mode: "tags",
      fileExtension: ".gen.ts",
      target: "./dist/zod",
      clean: true,
      // schemas: './dist/gen/model',
      override: {
        zod: {
          generate: {
            param: true,
            body: true,
            response: true,
            query: true,
            header: true,
          },
        },
      },
    },
  },
};
