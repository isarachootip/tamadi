import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const wellKnownDir = path.resolve(currentDir, "../public/.well-known");

interface AssetLinksEntry {
  readonly relation: readonly string[];
  readonly target: {
    readonly namespace: string;
    readonly package_name: string;
    readonly sha256_cert_fingerprints: readonly string[];
  };
}

interface AppleAssociationFile {
  readonly applinks: {
    readonly details: readonly {
      readonly appIDs: readonly string[];
      readonly components: readonly Readonly<Record<string, string>>[];
    }[];
  };
}

export function runWellKnownTests(): void {
  const assetLinksRaw = fs.readFileSync(
    path.join(wellKnownDir, "assetlinks.json"),
    "utf8"
  );
  const assetLinks = JSON.parse(assetLinksRaw) as readonly AssetLinksEntry[];
  assert.ok(Array.isArray(assetLinks) && assetLinks.length >= 1);
  assert.equal(assetLinks[0]?.target.namespace, "android_app");
  assert.equal(
    assetLinks[0]?.target.package_name,
    "online.tamadee.tamadee_mobile"
  );

  const aasaRaw = fs.readFileSync(
    path.join(wellKnownDir, "apple-app-site-association"),
    "utf8"
  );
  const aasa = JSON.parse(aasaRaw) as AppleAssociationFile;
  assert.ok(Array.isArray(aasa.applinks.details));
  assert.equal(
    aasa.applinks.details[0]?.appIDs[0],
    "TEAMID.online.tamadee.tamadeeMobile"
  );
}
