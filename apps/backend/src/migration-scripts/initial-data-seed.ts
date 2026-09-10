import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import seedUsData from "../lib/seed-us-data"

/**
 * Runs once on a fresh install (tracked in the script_migrations table).
 * Seeds the US-only baseline for withlovebyiris.com: store, region, tax
 * regions, stock location, shipping, and empty product categories.
 * No sample products or inventory are created.
 */
export default async function initial_data_seed({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Seeding initial US store data...")
  await seedUsData(container)
  logger.info("Finished seeding initial US store data.")
}
