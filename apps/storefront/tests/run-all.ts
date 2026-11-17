import { runDomainTests } from "./domain.test";
import { runMapperAndSchemaTests } from "./mappers-and-schemas.test";
import { runSurfaceAndSeoTests } from "./surface-and-seo.test";
import { runWellKnownTests } from "./well-known.test";

function main(): void {
  runDomainTests();
  console.log("✓ Domain unit tests passed");

  runMapperAndSchemaTests();
  console.log("✓ Zod boundary schema & mapper tests passed");

  runWellKnownTests();
  console.log("✓ Deep-link .well-known JSON tests passed");

  runSurfaceAndSeoTests();
  console.log("✓ Desktop surface & SEO canonical/JSON-LD tests passed");

  console.log("All @tamadee/storefront unit tests passed!");
}

main();
