import {
  reactExtension,
  Image,
  useSettings,
  Spacing,
  View,
  Grid,
  GridItemSize,
  TextBlock,
  BlockLayout,
  Background,
  BorderStyle,
  CornerRadius,
  Rows
} from "@shopify/ui-extensions-react/checkout";
import { Emphasis } from "@shopify/ui-extensions/src/surfaces/checkout/components/shared";
import { displayMobileStyle, displayDesktopStyle } from "lib/utils";

export default reactExtension("purchase.checkout.block.render", () => <Extension />);

interface settings {
  background?: Background;
  border?: BorderStyle;
  borderRadius?: CornerRadius;
  padding_block?: Spacing;
  padding_inline?: Spacing;
  text_style?: Emphasis | "normal";
  text_appearance?: TextAppearance | "normal";
  source_1?: string;
  text_1?: string;
  source_2?: string;
  text_2?: string;
  source_3?: string;
  text_3?: string;
  source_4?: string;
  text_4?: string;
  source_5?: string;
  text_5?: string;
}

function Extension() {
  const {
    background,
    border,
    borderRadius,
    padding_block,
    padding_inline,
    text_style,
    text_appearance,
    source_1,
    text_1,
    source_2,
    text_2,
    source_3,
    text_3,
    source_4,
    text_4,
    source_5,
    text_5
  }: settings = useSettings();

  const items = [
    { source: source_1, text: text_1 },
    { source: source_2, text: text_2 },
    { source: source_3, text: text_3 },
    { source: source_4, text: text_4 },
    { source: source_5, text: text_5 }
  ].filter(item => item.source && item.text);
  const size = sizes[items.length];
  const dynamicColumns = items.map(() => "1fr" as GridItemSize);

  const attributes = {
    columns: dynamicColumns,
    rows: "auto" as Rows,
    spacing: size.spacing,
    background,
    border,
    borderRadius,
    padding: [padding_block || "none", padding_inline] as [Spacing, Spacing]
  };
  const textAttributes = {};
  if (text_style !== "normal") textAttributes["emphasis"] = text_style;
  if (text_appearance !== "normal") textAttributes["appearance"] = text_appearance;

  return (
    <Grid {...attributes}>
      {items.map((item, index) => (
        <BlockLayout
          key={index}
          inlineAlignment={"center"}
          spacing={size.spacing}
          padding={["base", "none", "none", "none"]}>
          <View maxInlineSize={size.img} maxBlockSize={size.img}>
            <Image fit="cover" source={item.source} />
          </View>
          <View display={displayDesktopStyle}>
            <TextBlock {...textAttributes} inlineAlignment={"center"} size={size.text}>
              {item.text}
            </TextBlock>
          </View>
          <View display={displayMobileStyle}>
            <TextBlock {...textAttributes} inlineAlignment={"center"} size={size.text_mb}>
              {item.text}
            </TextBlock>
          </View>
        </BlockLayout>
      ))}
    </Grid>
  );
}

type TextAppearance = "accent" | "subdued" | "info" | "success" | "warning" | "critical" | "decorative";
const sizes = {
  "1": { img: 100, text: "large", text_mb: "medium", spacing: "tight" },
  "2": { img: 80, text: "medium", text_mb: "base", spacing: "tight" },
  "3": { img: 60, text: "base", text_mb: "small", spacing: "tight" },
  "4": { img: 40, text: "small", text_mb: "small", spacing: "extraTight" },
  "5": { img: 30, text: "extraSmall", spacing: "none" }
};
