import { useEffect, useMemo, useState, useRef } from "react";
import {
  reactExtension,
  Divider,
  Image,
  Banner,
  Heading,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyCartLinesChange,
  useApi,
  useSettings,
  View,
  Spacing,
  Background,
  BorderStyle,
  Button
} from "@shopify/ui-extensions-react/checkout";
import { displayMobileStyleAuto, displayDesktopStyleAuto, logger } from "../../../lib/utils";

const DEBUG = false;
const { log, error } = logger(DEBUG);

// Set up the entry point for the extension
export default reactExtension("purchase.checkout.block.render", () => {
  log("EXTENSION", "Starting extension render");
  try {
    return <App />;
  } catch (err) {
    error("EXTENSION", "Failed to render App:", err);
    return <ErrorFallback error={err} />;
  }
});

// Global debug mode - set to false for production
// CONFIG FLAGS FOR TESTING - Only used when DEBUG is true
const CONFIG = {
  ENABLE_VARIANT_FETCH: true,
  ENABLE_CART_OPERATIONS: true,
  ENABLE_PRODUCT_DISPLAY: true,
  ENABLE_BUTTON: true,
  ENABLE_ERROR_BANNER: true
};

interface Settings {
  heading_title: string;
  title: string;
  description: string;
  image: string;
  price: string;
  compare_price: string;
  percentage_text: string;
  button_text: string;
  variant: string;
  show_heading: boolean;
  show_description: boolean;
  show_price: boolean;
  show_compare_price: boolean;
  show_save_percentage: boolean;
  save_percentage_inline: boolean;
  prices_above_description: boolean;
  background: Background;
  border: BorderStyle;
  padding: [Spacing, Spacing];
}

interface VariantNode {
  id: string;
  price: {
    amount: string;
  };
  product: {
    id: string;
    title: string;
    images: {
      nodes: {
        url: string;
      }[];
    };
  };
}

// Basic types for cart lines
interface Merchandise {
  id: string;
}

interface CartLineType {
  id: string;
  merchandise: Merchandise;
}

interface ProductType {
  id: string;
  title: string;
  images: {
    nodes: {
      url: string;
    }[];
  };
  variants: {
    nodes: {
      id: string;
      price: {
        amount: string;
      };
      compareAtPrice: {
        amount: string;
      };
    }[];
  };
}

// GraphQL API response types
interface QueryData {
  node: VariantNode | null;
}

// Using a more generic type for i18n to avoid type mismatches
interface ShopifyI18n {
  formatCurrency: (amount: any, options?: any) => string;
}

function ErrorFallback({ error }: { error: any }): JSX.Element {
  return (
    <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>Extension Error</Heading>
      <Text>There was a problem loading this extension. Please try refreshing.</Text>
      <Text appearance="subdued">{error?.message || "Unknown error"}</Text>
    </BlockStack>
  );
}

function App() {
  log("App", "Component mounting");

  try {
    const { query, i18n } = useApi();
    log("App", "useApi hook successful");

    const applyCartLinesChange = useApplyCartLinesChange();
    log("App", "useApplyCartLinesChange hook successful");

    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [showError, setShowError] = useState(false);

    try {
      const lines = useCartLines() as CartLineType[];
      log("App", "useCartLines hook successful, lines count:", lines?.length);
    } catch (err) {
      error("App", "Failed to get cart lines:", err);
    }

    const lines = useCartLines() as CartLineType[];

    const rawSettings = useSettings();
    log("App", "useSettings hook successful:", rawSettings);

    const settings: Settings = useMemo(() => {
      const resolvedSettings: Settings = {
        heading_title: (rawSettings?.heading_title as string) || "ADD SHIPPING PROTECTION",
        title: (rawSettings?.title as string) || "Shipping protection",
        description: (rawSettings?.description as string) || "",
        image: (rawSettings?.image as string) || "",
        price: (rawSettings?.price as string) || "",
        compare_price: (rawSettings?.compare_price as string) || "",
        percentage_text: (rawSettings?.percentage_text as string) || "% off",
        button_text: (rawSettings?.button_text as string) || "+Add",
        variant: (rawSettings?.variant as string) || "",
        show_heading: rawSettings?.show_heading as boolean,
        show_description: rawSettings?.show_description as boolean,
        show_price: rawSettings?.show_price as boolean,
        show_compare_price: rawSettings?.show_compare_price as boolean,
        show_save_percentage: rawSettings?.show_save_percentage as boolean,
        save_percentage_inline: rawSettings?.save_percentage_inline as boolean,
        prices_above_description: rawSettings?.prices_above_description as boolean,
        background: (rawSettings?.background as Background) || "transparent",
        border: (rawSettings?.border as BorderStyle) || "base",
        padding: [rawSettings?.padding_block || "none", rawSettings?.padding_inline || "none"] as [Spacing, Spacing]
      };

      log("App", "Settings memoized:", resolvedSettings);
      return resolvedSettings;
    }, [rawSettings]);

    useEffect(() => {
      const variant = rawSettings?.variant;
      log("App", "useEffect for variant fetch triggered, rawSettings.variant:", variant);

      // Only check CONFIG in DEBUG mode
      if (variant && (!DEBUG || CONFIG.ENABLE_VARIANT_FETCH)) {
        fetchVariantData(variant as string);
      }
    }, [rawSettings?.variant]);

    useEffect(() => {
      if (showError) {
        log("App", "Error timeout effect triggered");
        const timer = setTimeout(() => setShowError(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [showError]);

    // Define cart operation functions
    const handleAddToCart = (variantId: string): void => {
      log("handleAddToCart", "Called with variantId:", variantId);

      // Only check CONFIG in DEBUG mode
      if (DEBUG && !CONFIG.ENABLE_CART_OPERATIONS) {
        log("handleAddToCart", "Cart operations disabled by config");
        return;
      }

      setAdding(true);
      applyCartLinesChange({
        type: "addCartLine",
        merchandiseId: variantId,
        quantity: 1
      })
        .then(result => {
          log("handleAddToCart", "Result:", result.type);
          setAdding(false);
          if (result.type === "error") {
            setShowError(true);
            error("handleAddToCart", "Error:", result.message);
          }
        })
        .catch(err => {
          error("handleAddToCart", "Failed:", err);
          setAdding(false);
          setShowError(true);
        });
    };

    const fetchVariantData = (variantGid: string): void => {
      log("fetchVariantData", "Starting fetch for variantId:", variantGid);
      setLoading(true);
      try {
        query(
          `query ($variantId: ID!) {
            node(id: $variantId) {
              ... on ProductVariant {
                id
                price {
                  amount
                }
                compareAtPrice {
                  amount
                }
                product {
                  id
                  title
                  images(first: 1) {
                    nodes {
                      url
                    }
                  }
                }
              }
            }
          }`,
          {
            variables: { variantId: variantGid }
          }
        )
          .then((result: any) => {
            log("fetchVariantData", "Query result received:", !!result?.data?.node);
            if (result?.data?.node) {
              // Format the product data
              const variant = result.data.node;
              log("fetchVariantData", "Variant data:", variant.id, variant.product.title);

              setProduct({
                id: variant.product.id,
                title: variant.product.title,
                images: variant.product.images,
                variants: {
                  nodes: [
                    {
                      id: variant.id,
                      price: variant.price,
                      compareAtPrice: variant.compareAtPrice
                    }
                  ]
                }
              });

              // Check if this variant is already in the cart
              const isInCart = lines.some(line => line.merchandise.id === variant.id);
              log("fetchVariantData", "Is variant in cart:", isInCart);
            } else {
              log("fetchVariantData", "No node data found in response");
            }
            setLoading(false);
          })
          .catch((err: Error) => {
            error("fetchVariantData", "Query failed:", err);
            setLoading(false);
          });
      } catch (err) {
        error("fetchVariantData", "Error in try block:", err);
        setLoading(false);
      }
    };

    if (loading) {
      log("App", "Rendering LoadingSkeleton");
      return <LoadingSkeleton settings={settings} />;
    }

    if (!loading && !product) {
      log("App", "No product data, returning null");
      return null;
    }

    // Make sure product is not null before accessing properties
    const variantId = product?.variants?.nodes[0]?.id;
    log("App", "Variant ID for cart check:", variantId);

    // Check if the variant is already in cart
    const isProductInCart = variantId ? lines.some(line => line.merchandise.id === variantId) : false;
    log("App", "Is product in cart:", isProductInCart);

    // Return null if product is already in cart
    if (isProductInCart) {
      log("App", "Product already in cart, returning null");
      return null;
    }

    // Skip rendering if display is disabled in config - only when DEBUG is true
    if (DEBUG && !CONFIG.ENABLE_PRODUCT_DISPLAY) {
      log("App", "Product display disabled by config");
      return null;
    }

    log("App", "Rendering ProductOffer component");
    return (
      <ProductOffer
        settings={settings}
        product={product}
        i18n={i18n}
        adding={adding}
        handleAddToCart={handleAddToCart}
        showError={showError}
      />
    );
  } catch (err) {
    error("App", "Fatal error in App component:", err);
    return <ErrorFallback error={err} />;
  }
}

function LoadingSkeleton({ settings }: { settings: Settings }): JSX.Element {
  log("LoadingSkeleton", "Rendering");
  return (
    <BlockStack spacing="tight">
      <Heading level={2}>{settings.heading_title}</Heading>
      <BlockStack spacing="loose">
        <InlineLayout spacing="base" columns={[64, "fill", "auto"]} blockAlignment="center">
          <SkeletonImage aspectRatio={1} />
          <BlockStack spacing="none">
            <SkeletonText inlineSize="large" />
            <SkeletonText inlineSize="small" />
          </BlockStack>
          <SkeletonText inlineSize="small" />
        </InlineLayout>
      </BlockStack>
    </BlockStack>
  );
}

interface ProductOfferProps {
  settings: Settings;
  product: ProductType;
  i18n: ShopifyI18n;
  adding: boolean;
  handleAddToCart: (variantId: string) => void;
  showError: boolean;
}

function ProductOffer({ settings, product, i18n, adding, handleAddToCart, showError }: ProductOfferProps): JSX.Element {
  log("ProductOffer", "Rendering with product:", product?.title);

  try {
    // Safety checks to avoid null reference errors
    if (!product || !product.variants || !product.variants.nodes || product.variants.nodes.length === 0) {
      log("ProductOffer", "Invalid product data, returning null");
      return null;
    }

    const { images, variants } = product;
    log("ProductOffer", "Product:", product);

    const currPrice = +(settings.price ? +settings.price / 100 : variants.nodes[0].price.amount);
    const currComparePrice = +(settings.compare_price
      ? +settings.compare_price / 100
      : variants.nodes[0].compareAtPrice.amount);
    const currSaveAmount = currComparePrice - currPrice;

    const currentPrice = i18n.formatCurrency(+currPrice) || "";
    const comparePrice = i18n.formatCurrency(+currComparePrice) || "";
    const savePercentage = ((currSaveAmount / currComparePrice) * 100).toFixed(0);

    const imageUrl = settings.image ?? (images?.nodes?.[0]?.url || "");
    const variantId = variants.nodes[0].id;
    const title = settings.title ?? product.title;

    log("ProductOffer", "Using image:", imageUrl?.substring(0, 50) + "...");

    const renderInlinePrices = () => {
      return (
        <InlineLayout spacing="extraTight" columns={["auto", "auto"]} blockAlignment="center">
          {settings.show_price && (
            <Text size="medium" emphasis="bold">
              {currentPrice}
            </Text>
          )}
          {settings.show_compare_price && (
            <Text size="base" appearance="subdued" accessibilityRole="deletion">
              {comparePrice}
            </Text>
          )}
          {settings.show_save_percentage && settings.save_percentage_inline && (
            <Text size="base" appearance="accent">
              {savePercentage}
              {settings.percentage_text}
            </Text>
          )}
        </InlineLayout>
      );
    };

    const renderPrices = () => {
      return (
        <BlockStack spacing="none">
          {settings.show_save_percentage && !settings.save_percentage_inline ? (
            <BlockStack spacing="none">
              {renderInlinePrices()}
              <Text size="base" appearance="accent">
                {savePercentage}
                {settings.percentage_text}
              </Text>
            </BlockStack>
          ) : (
            renderInlinePrices()
          )}
        </BlockStack>
      );
    };

    const renderAddToCartButton = () => {
      return (
        <>
          {/* Only check CONFIG in DEBUG mode */}
          {(!DEBUG || CONFIG.ENABLE_BUTTON) && (
            <Button
              kind="primary"
              accessibilityLabel={`Add ${title} to cart`}
              onPress={() => handleAddToCart(variantId)}
              loading={adding}>
              {settings.button_text}
            </Button>
          )}
        </>
      );
    };

    return (
      <BlockStack
        spacing="tight"
        background={settings.background}
        border={settings.border}
        borderWidth="base"
        borderRadius="base"
        padding={settings.padding}>
        {settings.show_heading && (
          <Text emphasis="bold" size="medium">
            {settings.heading_title}
          </Text>
        )}

        <View>
          {/* Mobile */}
          <InlineLayout
            display={displayMobileStyleAuto}
            spacing="base"
            columns={["fill", "auto"]}
            blockAlignment="center">
            <BlockStack spacing="none">
              <InlineLayout spacing="base" columns={[64, "auto"]} blockAlignment="center">
                <Image source={imageUrl} accessibilityDescription={title} aspectRatio={1} />
                <Text size="medium" emphasis="bold">
                  {title}
                </Text>
              </InlineLayout>

              {settings.prices_above_description && renderPrices()}

              {settings.show_description && (
                <Text size="small" appearance="subdued">
                  {settings.description}
                </Text>
              )}

              {!settings.prices_above_description && renderPrices()}
            </BlockStack>

            {renderAddToCartButton()}
          </InlineLayout>

          {/* Desktop */}
          <InlineLayout
            display={displayDesktopStyleAuto}
            spacing="base"
            columns={[80, "fill", "auto"]}
            blockAlignment="center">
            <Image source={imageUrl} accessibilityDescription={title} aspectRatio={1} />
            <BlockStack spacing="none">
              <Text size="medium" emphasis="bold">
                {title}
              </Text>

              {settings.prices_above_description && renderPrices()}

              {settings.show_description && (
                <Text size="small" appearance="subdued">
                  {settings.description}
                </Text>
              )}

              {!settings.prices_above_description && renderPrices()}
            </BlockStack>

            {renderAddToCartButton()}
          </InlineLayout>
        </View>

        {showError && (!DEBUG || CONFIG.ENABLE_ERROR_BANNER) && <ErrorBanner />}
      </BlockStack>
    );
  } catch (err) {
    error("ProductOffer", "Error rendering component:", err);
    return (
      <BlockStack spacing="loose">
        <Heading level={2}>Shipping Protection</Heading>
        <Text>There was a problem displaying this option.</Text>
      </BlockStack>
    );
  }
}

function ErrorBanner(): JSX.Element {
  log("ErrorBanner", "Rendering");
  return <Banner status="critical">There was an issue adding this product. Please try again.</Banner>;
}
