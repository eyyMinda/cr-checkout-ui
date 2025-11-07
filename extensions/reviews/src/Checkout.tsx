import {
  reactExtension,
  Image,
  useSettings,
  Spacing,
  View,
  TextBlock,
  Text,
  Grid,
  Background,
  BorderStyle,
  CornerRadius,
  InlineStack,
  ScrollView,
  InlineSpacer,
  GridItem,
  BlockSpacer,
  InlineLayout
} from "@shopify/ui-extensions-react/checkout";
import { displayMobileStyle, displayDesktopStyle, normalizeImageSize } from "lib/utils";
export default reactExtension("purchase.checkout.block.render", () => <Extension />);

interface settings {
  maxBlockSize?: number;
  spacer?: Exclude<Spacing, "none">;
  minInlineSize?: number;
  spacing?: Spacing;
  background?: Background;
  border?: BorderStyle;
  borderRadius?: CornerRadius;
  stars?: string;
  verified?: string;
  author_source_1?: string;
  text_1?: string;
  author_1?: string;
  author_source_2?: string;
  text_2?: string;
  author_2?: string;
  author_source_3?: string;
  text_3?: string;
  author_3?: string;
  padding_block?: Spacing;
  padding_inline?: Spacing;
}

function Extension() {
  const {
    maxBlockSize,
    spacer,
    minInlineSize,
    spacing,
    background,
    border,
    borderRadius,
    stars,
    verified,
    author_source_1,
    author_1,
    text_1,
    author_source_2,
    author_2,
    text_2,
    author_source_3,
    author_3,
    text_3,
    padding_block,
    padding_inline
  }: settings = useSettings();

  const reviews = [
    { source: author_source_1, author: author_1, text: text_1 },
    { source: author_source_2, author: author_2, text: text_2 },
    { source: author_source_3, author: author_3, text: text_3 }
  ].filter(item => item.source && item.author && item.text);

  const reviewAttributes = {
    background,
    border,
    borderRadius,
    padding: [padding_block || "none", padding_inline] as [Spacing, Spacing]
  };

  return (
    <ScrollView direction={"inline"} maxBlockSize={normalizeImageSize(maxBlockSize, 300)}>
      <InlineLayout spacing={spacer} minInlineSize={"fill"}>
        {reviews.map((v, index) => (
          <View {...reviewAttributes} key={index} minInlineSize={normalizeImageSize(minInlineSize, 320)}>
            <Grid columns={[60, "1fr"]} rows={["auto", "auto"]} spacing={["none", "tight"]} blockAlignment={"center"}>
              {v.source && (
                <GridItem maxInlineSize={60} maxBlockSize={60} rowSpan={2}>
                  <Image fit="cover" source={v.source} aspectRatio={1} cornerRadius={"fullyRounded"} />
                </GridItem>
              )}
              {stars && (
                <View maxInlineSize={80}>
                  <Image fit="contain" source={stars} cornerRadius="none" />
                </View>
              )}
              <InlineStack spacing={"tight"} blockAlignment={"center"}>
                <Text size={"small"} emphasis={"bold"}>
                  {v.author}
                </Text>
                {verified && (
                  <View maxInlineSize={16}>
                    <Image fit="contain" source={verified} cornerRadius="none" />
                  </View>
                )}
              </InlineStack>
            </Grid>

            <BlockSpacer spacing={spacing} />

            <View display={displayDesktopStyle}>
              <TextBlock size={"base"}>{v.text}</TextBlock>
            </View>

            <View display={displayMobileStyle}>
              <TextBlock size={"small"}>{v.text}</TextBlock>
            </View>
          </View>
        ))}
      </InlineLayout>
    </ScrollView>
  );
}
