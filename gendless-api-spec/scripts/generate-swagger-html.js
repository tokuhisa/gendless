import fs from 'fs';
import path from 'path';

// Define paths
const rootDir = path.resolve(process.cwd());
const openapiJsonPath = path.join(rootDir, 'tsp-output', 'schema', 'openapi.json');
const swaggerHtmlTemplatePath = path.join(rootDir, 'src', 'swagger.html');
const outputDir = path.join(rootDir, 'tsp-output');
const outputHtmlPath = path.join(outputDir, 'swagger.html');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // Read the OpenAPI JSON file
  const openapiJson = fs.readFileSync(openapiJsonPath, 'utf8');

  // Parse the JSON to ensure it's a valid object
  const openapiObject = JSON.parse(openapiJson);

  // Read the Swagger HTML template
  const swaggerHtmlTemplate = fs.readFileSync(swaggerHtmlTemplatePath, 'utf8');

  // Replace {SPEC} placeholder with the OpenAPI JSON content
  // Using JSON.stringify to convert the object back to a string that can be used as a JavaScript object
  const generatedHtml = swaggerHtmlTemplate.replace('SPEC', JSON.stringify(openapiObject));

  // Write the generated HTML to the output file
  fs.writeFileSync(outputHtmlPath, generatedHtml);

  console.log(`Successfully generated Swagger HTML at: ${outputHtmlPath}`);
} catch (error) {
  console.error('Error generating Swagger HTML:', error);
  process.exit(1);
}
