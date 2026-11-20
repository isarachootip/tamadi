import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows";
import { ProductChangeActionType } from "@mercurjs/types";
import type {
  UpdatedProductMediaSummary,
  UpdateProductMediaRecordParams,
} from "./vendor-catalog-types";

export async function checkSellerOwnsProduct(
  container: MedusaContainer,
  sellerId: string,
  productId: string
): Promise<boolean> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const [{ data: sellerLinks }, { data: addActions }] = await Promise.all([
    query.graph({
      entity: "product_seller",
      fields: ["product_id"],
      filters: { seller_id: sellerId, product_id: productId },
    }),
    query.graph({
      entity: "product_change_action",
      fields: ["product_id"],
      filters: {
        action: ProductChangeActionType.PRODUCT_ADD,
        product_id: productId,
        product_change: { created_by: sellerId },
      },
    }),
  ]);

  return sellerLinks.length > 0 || addActions.length > 0;
}

export async function persistProductMediaUpdate(
  container: MedusaContainer,
  params: UpdateProductMediaRecordParams
): Promise<UpdatedProductMediaSummary> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  await updateProductsWorkflow(container).run({
    input: {
      products: [
        {
          id: params.productId,
          thumbnail: params.thumbnail,
          images: params.images.map((url) => ({ url })),
          ...(params.status ? { status: params.status } : {}),
        },
      ],
    },
  });

  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "handle", "status", "thumbnail", "images.url"],
    filters: { id: params.productId },
  });

  const updated = (
    data as Array<{
      id: string;
      title: string;
      handle: string;
      status: string;
      thumbnail?: string | null;
      images?: Array<{ url: string }>;
    }>
  )[0];

  return {
    id: updated.id,
    title: updated.title,
    handle: updated.handle,
    status: updated.status,
    thumbnail: updated.thumbnail ?? null,
    images: (updated.images ?? []).map((img) => ({ url: img.url })),
  };
}
