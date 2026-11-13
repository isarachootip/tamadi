import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";
import { createProductAttributesWorkflow } from "@mercurjs/core/workflows";
import { AttributeType } from "@mercurjs/types";
import { TAMADEE_CATEGORIES, TAMADEE_PRODUCTS } from "./catalog-data";
import { collectCatalogAttributeValues } from "./catalog-helpers";

export interface SeededAttribute {
  readonly id: string;
  readonly handle: string;
  readonly values: { readonly id: string; readonly name: string }[];
}

export interface CategoriesAndAttributesResult {
  readonly categoryIdsByKey: Map<string, string>;
  readonly sizeAttr: SeededAttribute;
  readonly colorAttr: SeededAttribute;
}

export async function ensureCategoriesAndAttributes(
  container: MedusaContainer
): Promise<CategoriesAndAttributesResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productModule = container.resolve(Modules.PRODUCT);

  logger.info("[Tamadee Seed] Seeding 5 Thai categories...");
  const existingCats = await productModule.listProductCategories({
    handle: TAMADEE_CATEGORIES.map((c) => c.handle),
  });
  const categoryIdsByKey = new Map<string, string>();
  for (const cat of existingCats) {
    const match = TAMADEE_CATEGORIES.find((c) => c.handle === cat.handle);
    if (match) categoryIdsByKey.set(match.key, cat.id);
  }

  const missingCats = TAMADEE_CATEGORIES.filter(
    (c) => !categoryIdsByKey.has(c.key)
  );
  if (missingCats.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missingCats.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
          rank: TAMADEE_CATEGORIES.findIndex((x) => x.key === c.key),
        })),
      },
    });
    for (const created of result) {
      const match = TAMADEE_CATEGORIES.find((c) => c.handle === created.handle);
      if (match) categoryIdsByKey.set(match.key, created.id);
    }
  }

  logger.info("[Tamadee Seed] Seeding Size & Color product attributes...");
  const attrValues = collectCatalogAttributeValues(TAMADEE_PRODUCTS);
  const attrDefs = [
    { name: "Size", handle: "size", values: attrValues.sizes },
    { name: "Color", handle: "color", values: attrValues.colors },
  ];

  const loadAttrs = async (): Promise<Map<string, SeededAttribute>> => {
    const { data } = await query.graph({
      entity: "product_attribute",
      fields: ["id", "handle", "values.id", "values.name"],
      filters: { handle: ["size", "color"], product_id: null },
    });
    return new Map(
      (data as SeededAttribute[]).map((a) => [a.handle, a])
    );
  };

  let attrMap = await loadAttrs();
  const missingAttrs = attrDefs.filter((d) => !attrMap.has(d.handle));
  if (missingAttrs.length > 0) {
    await createProductAttributesWorkflow(container).run({
      input: {
        attributes: missingAttrs.map((d, idx) => ({
          name: d.name,
          handle: d.handle,
          type: AttributeType.MULTI_SELECT,
          is_variant_axis: true,
          is_filterable: true,
          rank: idx,
          values: d.values.map((name, rank) => ({ name, rank })),
        })),
      },
    });
    attrMap = await loadAttrs();
  }

  return {
    categoryIdsByKey,
    sizeAttr: attrMap.get("size")!,
    colorAttr: attrMap.get("color")!,
  };
}
