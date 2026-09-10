import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
  deleteProductCategoriesWorkflow,
  updateProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"
import { PRODUCT_CATEGORIES } from "../lib/seed-us-data"

/**
 * Brings an already-seeded database to the four-category tree in
 * docs/BUSINESS.md. The first seed created five placeholder categories before
 * the product research; this retires the ones that no longer exist, creates the
 * new ones, and backfills rank and description on the two that carried over.
 *
 * Idempotent. Run with:
 *   cd apps/backend && pnpm exec medusa exec ./src/scripts/apply-catalog-v2.ts
 */
const RETIRED_HANDLES = ["soap", "crafts", "gift-sets"]

export default async function applyCatalogV2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Applying the four-category tree...")

  const { data: retired } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: RETIRED_HANDLES },
  })

  if (retired.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: retired.map((category) => category.id),
    })
    logger.info(
      `Retired ${retired.length} placeholder categories: ${retired
        .map((category) => category.handle)
        .join(", ")}`
    )
  } else {
    logger.info("No placeholder categories to retire.")
  }

  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "name", "rank", "description"],
    filters: { handle: PRODUCT_CATEGORIES.map((category) => category.handle) },
  })
  const existingByHandle = new Map(
    existing.map((category) => [category.handle, category])
  )

  const toCreate = PRODUCT_CATEGORIES.filter(
    (category) => !existingByHandle.has(category.handle)
  )

  if (toCreate.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: toCreate.map((category) => ({
          name: category.name,
          handle: category.handle,
          description: category.description,
          rank: category.rank,
          is_active: true,
        })),
      },
    })
    logger.info(
      `Created ${toCreate.length} categories: ${toCreate
        .map((category) => category.handle)
        .join(", ")}`
    )
  } else {
    logger.info("All four categories already exist.")
  }

  for (const category of PRODUCT_CATEGORIES) {
    const current = existingByHandle.get(category.handle)

    if (!current) {
      continue
    }

    const needsUpdate =
      current.name !== category.name ||
      current.rank !== category.rank ||
      current.description !== category.description

    if (!needsUpdate) {
      continue
    }

    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: current.id },
        update: {
          name: category.name,
          description: category.description,
          rank: category.rank,
          is_active: true,
        },
      },
    })
    logger.info(`Updated category ${category.handle}.`)
  }

  logger.info("Finished applying the four-category tree.")
}
