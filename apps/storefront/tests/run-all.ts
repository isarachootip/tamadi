import { runAiSchemaTests } from "./ai-schemas.test";
import { runDomainTests } from "./domain.test";
import { runI18nTests } from "./i18n.test";
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

  runAiSchemaTests();
  console.log("✓ AI assistant boundary schema tests passed");

  runI18nTests();
  console.log("✓ Trilingual i18n (TH/EN/ZH) & catalog localization tests passed");

  console.log("All @tamadee/storefront unit tests passed!");
}

main();
