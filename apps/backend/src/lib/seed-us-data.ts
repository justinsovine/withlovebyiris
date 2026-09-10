import { MedusaContainer } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  Modules,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Seeds the US-only baseline data for withlovebyiris.com.
 *
 * Shared by the initial migration script (fresh installs) and the one-off
 * reset script (existing local databases) so the two never drift. Every
 * section checks for existing records first, so it is safe to run more
 * than once against the same database.
 */

export const DEFAULT_SALES_CHANNEL_NAME = "Default Sales Channel"
export const US_REGION_NAME = "United States"
export const US_COUNTRY_CODE = "us"
export const OHIO_PROVINCE_CODE = "oh"
export const STOCK_LOCATION_NAME = "Cincinnati Studio"
export const FULFILLMENT_SET_NAME = "Cincinnati Shipping"
export const SERVICE_ZONE_NAME = "United States"
export const SHIPPING_PROFILE_NAME = "Default"
export const FULFILLMENT_PROVIDER_ID = "manual_manual"
export const PAYMENT_PROVIDER_ID = "pp_system_default"
export const TAX_PROVIDER_ID = "tp_system"

// Ohio is origin-sourced for in-state sales, so the shop charges the combined
// rate for its own location: Hamilton County, Ohio (Cincinnati).
// 5.75% state + 2.05% Hamilton County = 7.8%.
// TODO: The owner must verify this rate with the Ohio Department of Taxation
// before launch. County rates change and this value is not authoritative.
export const OHIO_SALES_TAX_RATE = 7.8
export const OHIO_SALES_TAX_NAME = "Ohio Sales Tax"
export const OHIO_SALES_TAX_CODE = "OH_SALES_TAX"

// Four categories, ordered by rank so navigation reflects the priority the
// market research set: keepsakes are uncontested locally and carry the margin,
// candles are an overdone gift add-on. See docs/BUSINESS.md.
// "For Him" is a tag and a landing page, never a category.
export const PRODUCT_CATEGORIES = [
  {
    name: "Keepsakes",
    handle: "keepsakes",
    description:
      "Memory bears, memory pillows, and quilts sewn from the clothes of someone you love.",
    rank: 0,
  },
  {
    name: "Bath & Body",
    handle: "bath-body",
    description:
      "The Wholesome Living line: shampoo bars, beard balms, and tallow balm, made in small batches.",
    rank: 1,
  },
  {
    name: "Candles",
    handle: "candles",
    description:
      "Pure beeswax candles with a verse on the lid. No fragrance, no soot.",
    rank: 2,
  },
  {
    name: "Gifts",
    handle: "gifts",
    description: "Ready to give, wrapped by hand in Bethel, Ohio.",
    rank: 3,
  },
]

export const SHIPPING_OPTIONS = [
  {
    name: "Standard Shipping",
    amount: 6.95,
    type: {
      label: "Standard",
      description: "Ships in 2-5 business days.",
      code: "standard",
    },
  },
  {
    name: "Local Pickup",
    amount: 0,
    type: {
      label: "Pickup",
      description: "Pick up your order in Cincinnati, OH.",
      code: "pickup",
    },
  },
]

export default async function seedUsData(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )

  logger.info("Seeding store data...")

  const { data: existingSalesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
    filters: { name: DEFAULT_SALES_CHANNEL_NAME },
  })

  let defaultSalesChannel: { id: string } | undefined =
    existingSalesChannels[0]

  if (!defaultSalesChannel) {
    const {
      result: [createdSalesChannel],
    } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: DEFAULT_SALES_CHANNEL_NAME,
            description: "Created by Medusa",
          },
        ],
      },
    })
    defaultSalesChannel = createdSalesChannel
  } else {
    logger.info("Default sales channel already exists, skipping.")
  }

  const { data: existingApiKeys } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  })

  if (!existingApiKeys.length) {
    const {
      result: [publishableApiKey],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Default Publishable API Key",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    })

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    })
  } else {
    logger.info("Publishable API key already exists, skipping.")
  }

  const { data: existingStores } = await query.graph({
    entity: "store",
    fields: ["id"],
  })

  const storeData = {
    name: "With Love By Iris",
    supported_currencies: [
      {
        currency_code: "usd",
        is_default: true,
      },
    ],
    default_sales_channel_id: defaultSalesChannel.id,
  }

  let store: { id: string } | undefined = existingStores[0]

  if (store) {
    const {
      result: [updatedStore],
    } = await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: storeData,
      },
    })
    store = updatedStore
  } else {
    const {
      result: [createdStore],
    } = await createStoresWorkflow(container).run({
      input: {
        stores: [storeData],
      },
    })
    store = createdStore
  }
  logger.info("Finished seeding store data.")

  logger.info("Seeding region data...")
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    filters: { name: US_REGION_NAME },
  })

  let region: { id: string } | undefined = existingRegions[0]

  if (!region) {
    const { result: regionResult } = await createRegionsWorkflow(
      container
    ).run({
      input: {
        regions: [
          {
            name: US_REGION_NAME,
            currency_code: "usd",
            countries: [US_COUNTRY_CODE],
            payment_providers: [PAYMENT_PROVIDER_ID],
          },
        ],
      },
    })
    region = regionResult[0]
  } else {
    logger.info("US region already exists, skipping.")
  }
  logger.info("Finished seeding regions.")

  logger.info("Seeding tax regions...")
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code", "province_code"],
    filters: { country_code: US_COUNTRY_CODE },
  })

  let usTaxRegion: { id: string } | undefined = existingTaxRegions.find(
    (t) => !t.province_code
  )

  if (!usTaxRegion) {
    const {
      result: [createdUsTaxRegion],
    } = await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: US_COUNTRY_CODE,
          provider_id: TAX_PROVIDER_ID,
        },
      ],
    })
    usTaxRegion = createdUsTaxRegion
  } else {
    logger.info("US tax region already exists, skipping.")
  }

  const ohioTaxRegion = existingTaxRegions.find(
    (t) => t.province_code === OHIO_PROVINCE_CODE
  )

  if (!ohioTaxRegion) {
    await createTaxRegionsWorkflow(container).run({
      input: [
        {
          country_code: US_COUNTRY_CODE,
          province_code: OHIO_PROVINCE_CODE,
          parent_id: usTaxRegion.id,
          default_tax_rate: {
            name: OHIO_SALES_TAX_NAME,
            code: OHIO_SALES_TAX_CODE,
            rate: OHIO_SALES_TAX_RATE,
          },
        },
      ],
    })
  } else {
    logger.info("Ohio tax region already exists, skipping.")
  }
  logger.info("Finished seeding tax regions.")

  logger.info("Seeding stock location data...")
  const { data: existingStockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
    filters: { name: STOCK_LOCATION_NAME },
  })

  let stockLocation: { id: string } | undefined = existingStockLocations[0]

  if (!stockLocation) {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: STOCK_LOCATION_NAME,
            address: {
              // TODO: Replace with the studio's real street address before
              // launch. It is shown on shipping labels and pickup details.
              address_1: "PLACEHOLDER STREET ADDRESS",
              city: "Cincinnati",
              province: "OH",
              postal_code: "45202",
              country_code: "US",
            },
          },
        ],
      },
    })
    stockLocation = stockLocationResult[0]

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: FULFILLMENT_PROVIDER_ID,
      },
    })
  } else {
    logger.info("Stock location already exists, skipping.")
  }

  logger.info("Seeding fulfillment data...")
  // Core creates a default shipping profile in a migration script. Reuse it
  // when present so products are not split across two default profiles.
  const { data: shippingProfileResult } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name", "type"],
    filters: { type: "default" },
  })

  let shippingProfile: { id: string } | undefined = shippingProfileResult[0]

  if (!shippingProfile) {
    const {
      result: [createdShippingProfile],
    } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: SHIPPING_PROFILE_NAME,
            type: "default",
          },
        ],
      },
    })
    shippingProfile = createdShippingProfile
  }

  const existingFulfillmentSets =
    await fulfillmentModuleService.listFulfillmentSets(
      { name: FULFILLMENT_SET_NAME },
      { relations: ["service_zones"] }
    )

  let fulfillmentSet = existingFulfillmentSets[0]

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: FULFILLMENT_SET_NAME,
      type: "shipping",
      service_zones: [
        {
          name: SERVICE_ZONE_NAME,
          geo_zones: [
            {
              country_code: US_COUNTRY_CODE,
              type: "country",
            },
          ],
        },
      ],
    })

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    })
  } else {
    logger.info("Fulfillment set already exists, skipping.")
  }

  const serviceZone = fulfillmentSet.service_zones[0]

  const { data: existingShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { service_zone_id: serviceZone.id },
  })
  const existingShippingOptionNames = new Set(
    existingShippingOptions.map((option) => option.name)
  )

  const shippingOptionsToCreate = SHIPPING_OPTIONS.filter(
    (option) => !existingShippingOptionNames.has(option.name)
  )

  if (shippingOptionsToCreate.length) {
    await createShippingOptionsWorkflow(container).run({
      input: shippingOptionsToCreate.map((option) => ({
        name: option.name,
        price_type: "flat" as const,
        provider_id: FULFILLMENT_PROVIDER_ID,
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfile.id,
        type: option.type,
        // Medusa stores prices as-is: 6.95 is stored as 6.95, not 695.
        prices: [
          {
            currency_code: "usd",
            amount: option.amount,
          },
          {
            region_id: region.id,
            amount: option.amount,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq" as const,
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq" as const,
          },
        ],
      })),
    })
  } else {
    logger.info("Shipping options already exist, skipping.")
  }
  logger.info("Finished seeding fulfillment data.")

  const { data: linkedSalesChannels } = await query.graph({
    entity: "stock_location",
    fields: ["id", "sales_channels.id"],
    filters: { id: stockLocation.id },
  })
  const alreadyLinked = (linkedSalesChannels[0]?.sales_channels ?? []).some(
    (channel) => channel?.id === defaultSalesChannel.id
  )

  if (!alreadyLinked) {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel.id],
      },
    })
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_region_id: region.id,
        default_location_id: stockLocation.id,
      },
    },
  })
  logger.info("Finished seeding stock location data.")

  logger.info("Seeding product categories...")
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
    filters: { handle: PRODUCT_CATEGORIES.map((category) => category.handle) },
  })
  const existingCategoryHandles = new Set(
    existingCategories.map((category) => category.handle)
  )

  const categoriesToCreate = PRODUCT_CATEGORIES.filter(
    (category) => !existingCategoryHandles.has(category.handle)
  )

  if (categoriesToCreate.length) {
    await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: categoriesToCreate.map((category) => ({
          name: category.name,
          handle: category.handle,
          description: category.description,
          rank: category.rank,
          is_active: true,
        })),
      },
    })
  } else {
    logger.info("Product categories already exist, skipping.")
  }
  logger.info("Finished seeding product categories.")
}
