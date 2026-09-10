import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
} from "@medusajs/framework/utils"
import {
  deleteFulfillmentSetsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteProductOptionsWorkflow,
  deleteProductsWorkflow,
  deleteRegionsWorkflow,
  deleteShippingOptionsWorkflow,
  deleteStockLocationsWorkflow,
  deleteTaxRegionsWorkflow,
} from "@medusajs/medusa/core-flows"
import seedUsData, {
  FULFILLMENT_SET_NAME,
  PRODUCT_CATEGORIES,
  STOCK_LOCATION_NAME,
  US_COUNTRY_CODE,
  US_REGION_NAME,
} from "../lib/seed-us-data"

/**
 * One-off script for databases that already ran the original Europe-centric
 * initial-data-seed. Removes the sample apparel products and all European
 * regions, tax regions, stock locations, and shipping, then seeds the same
 * US-only data a fresh install gets.
 *
 * Run with:
 *   cd apps/backend && pnpm exec medusa exec ./src/scripts/reset-to-us.ts
 */
export default async function resetToUs({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  const runStep = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn()
      logger.info(`Done: ${label}`)
    } catch (error) {
      logger.error(`Failed: ${label}`, error)
    }
  }

  logger.info("Resetting store data to US-only...")

  await runStep("delete sample products", async () => {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title"],
    })

    if (!products.length) {
      logger.info("No products to delete.")
      return
    }

    await deleteProductsWorkflow(container).run({
      input: { ids: products.map((product) => product.id) },
    })
    logger.info(`Deleted ${products.length} product(s).`)
  })

  await runStep("delete sample product options", async () => {
    const { data: options } = await query.graph({
      entity: "product_option",
      fields: ["id", "title"],
    })

    if (!options.length) {
      return
    }

    await deleteProductOptionsWorkflow(container).run({
      input: { ids: options.map((option) => option.id) },
    })
    logger.info(`Deleted ${options.length} product option(s).`)
  })

  await runStep("delete sample product categories", async () => {
    const keepHandles = new Set(
      PRODUCT_CATEGORIES.map((category) => category.handle)
    )
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["id", "name", "handle"],
    })
    const toDelete = categories.filter(
      (category) => !keepHandles.has(category.handle)
    )

    if (!toDelete.length) {
      return
    }

    await deleteProductCategoriesWorkflow(container).run({
      input: toDelete.map((category) => category.id),
    })
    logger.info(`Deleted ${toDelete.length} product categor(ies).`)
  })

  await runStep("delete non-US shipping options", async () => {
    const { data: shippingOptions } = await query.graph({
      entity: "shipping_option",
      fields: ["id", "name", "service_zone.fulfillment_set.name"],
    })
    const toDelete = shippingOptions.filter(
      (option) =>
        option.service_zone?.fulfillment_set?.name !== FULFILLMENT_SET_NAME
    )

    if (!toDelete.length) {
      return
    }

    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: toDelete.map((option) => option.id) },
    })
    logger.info(`Deleted ${toDelete.length} shipping option(s).`)
  })

  await runStep("delete non-US fulfillment sets", async () => {
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets(
      {},
      { select: ["id", "name"] }
    )
    const toDelete = fulfillmentSets.filter(
      (set) => set.name !== FULFILLMENT_SET_NAME
    )

    if (!toDelete.length) {
      return
    }

    // Service zones and geo zones cascade with the fulfillment set.
    await deleteFulfillmentSetsWorkflow(container).run({
      input: { ids: toDelete.map((set) => set.id) },
    })
    logger.info(`Deleted ${toDelete.length} fulfillment set(s).`)
  })

  await runStep("delete non-US stock locations", async () => {
    const { data: stockLocations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name"],
    })
    const toDelete = stockLocations.filter(
      (location) => location.name !== STOCK_LOCATION_NAME
    )

    if (!toDelete.length) {
      return
    }

    await deleteStockLocationsWorkflow(container).run({
      input: { ids: toDelete.map((location) => location.id) },
    })
    logger.info(`Deleted ${toDelete.length} stock location(s).`)
  })

  await runStep("delete non-US regions", async () => {
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "name"],
    })
    const toDelete = regions.filter((region) => region.name !== US_REGION_NAME)

    if (!toDelete.length) {
      return
    }

    await deleteRegionsWorkflow(container).run({
      input: { ids: toDelete.map((region) => region.id) },
    })
    logger.info(`Deleted ${toDelete.length} region(s).`)
  })

  await runStep("delete non-US tax regions", async () => {
    const { data: taxRegions } = await query.graph({
      entity: "tax_region",
      fields: ["id", "country_code"],
    })
    const toDelete = taxRegions.filter(
      (taxRegion) => taxRegion.country_code !== US_COUNTRY_CODE
    )

    if (!toDelete.length) {
      return
    }

    await deleteTaxRegionsWorkflow(container).run({
      input: { ids: toDelete.map((taxRegion) => taxRegion.id) },
    })
    logger.info(`Deleted ${toDelete.length} tax region(s).`)
  })

  logger.info("Seeding US data...")
  await seedUsData(container)
  logger.info("Finished resetting store data to US-only.")
}
