import {
  reactExtension,
  Image,
  useSettings,
  Spacing,
  View,
  BlockStack,
  TextBlock,
  Text,
  Grid,
  Background,
  BorderStyle,
  CornerRadius,
  Rows,
  Columns,
  Alignment
} from "@shopify/ui-extensions-react/checkout";
import { BorderWidth } from "@shopify/ui-extensions/src/surfaces/checkout";
import { displayMobileStyle, displayDesktopStyle } from "lib/utils";
export default reactExtension("purchase.checkout.header.render-after", () => <Extension />);

interface settings {
  background?: Background;
  border?: BorderStyle;
  borderWidth?: BorderWidth;
  borderRadius?: CornerRadius;
  blockSpacing?: Spacing;
  blockAlignment?: Alignment;
  spacing?: Spacing;
  padding_block?: Spacing;
  padding_inline?: Spacing;
  icon_source_1?: string;
  title_1?: string;
  text_1?: string;
  icon_source_2?: string;
  title_2?: string;
  text_2?: string;
  icon_source_3?: string;
  title_3?: string;
  text_3?: string;
  icon_source_4?: string;
  title_4?: string;
  text_4?: string;
}

function Extension() {
  const {
    background,
    border,
    borderRadius,
    blockSpacing,
    blockAlignment,
    spacing,
    padding_block,
    padding_inline,
    icon_source_1,
    title_1,
    text_1,
    icon_source_2,
    title_2,
    text_2,
    icon_source_3,
    title_3,
    text_3,
    icon_source_4,
    title_4,
    text_4
  }: settings = useSettings();

  const usps = [
    { source: icon_source_1, title: title_1, text: text_1 },
    { source: icon_source_2, title: title_2, text: text_2 },
    { source: icon_source_3, title: title_3, text: text_3 },
    { source: icon_source_4, title: title_4, text: text_4 }
  ].filter(item => item.source && item.title && item.text);

  const attributes = {
    columns: ["auto", "fill"] as Columns,
    rows: "auto" as Rows,
    blockAlignment,
    spacing,
    background,
    border,
    borderRadius,
    padding: [padding_block || "none", padding_inline] as [Spacing, Spacing]
  };

  return (
    <BlockStack spacing={blockSpacing}>
      {usps.map((v, index) => (
        <Grid {...attributes} key={index}>
          {v.source && (
            <>
              <View maxInlineSize={45} display={displayDesktopStyle}>
                <Image fit="cover" source={v.source} cornerRadius={"fullyRounded"} />
              </View>
              <View maxInlineSize={30} display={displayMobileStyle}>
                <Image fit="cover" source={v.source} cornerRadius={"fullyRounded"} />
              </View>
            </>
          )}
          <BlockStack spacing={"extraTight"}>
            <View display={displayDesktopStyle}>
              <Text size={"base"} emphasis={"bold"}>
                {v.title}
              </Text>
            </View>
            <View display={displayMobileStyle}>
              <Text size={"small"} emphasis={"bold"}>
                {v.title}
              </Text>
            </View>

            <View display={displayDesktopStyle}>
              <TextBlock size={"base"}>{v.text}</TextBlock>
            </View>
            <View display={displayMobileStyle}>
              <TextBlock size={"small"}>{v.text}</TextBlock>
            </View>
          </BlockStack>
        </Grid>
      ))}
    </BlockStack>
  );
}
