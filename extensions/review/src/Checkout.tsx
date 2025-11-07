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
  Style
} from "@shopify/ui-extensions-react/checkout";
import { displayMobileStyle, displayDesktopStyle } from "lib/utils";
export default reactExtension("purchase.checkout.block.render", () => <Extension />);

interface settings {
  background?: Background;
  border?: BorderStyle;
  borderRadius?: CornerRadius;
  author_source?: string;
  text?: string;
  stars?: string;
  author?: string;
  date?: string;
  padding_block?: Spacing;
  padding_inline?: Spacing;
}

function Extension() {
  const {
    background,
    border,
    borderRadius,
    author_source,
    text,
    stars,
    author,
    date,
    padding_block,
    padding_inline
  }: settings = useSettings();

  const attributes = {
    columns: ["12%", "fill"] as Columns,
    rows: "auto" as Rows,
    spacing: "base" as Spacing,
    background,
    border,
    borderRadius,
    padding: [padding_block || "none", padding_inline] as [Spacing, Spacing]
  };

  return (
    <Grid {...attributes}>
      {author_source && (
        <View maxInlineSize={60} maxBlockSize={60} padding={["tight", "none"]}>
          <Image fit="cover" source={author_source} aspectRatio={1} cornerRadius={"fullyRounded"} />
        </View>
      )}
      <BlockStack spacing={"tight"}>
        {
          <View display={displayDesktopStyle}>
            <TextBlock size={"medium"}>{text}</TextBlock>
          </View>
        }
        {
          <View display={displayMobileStyle}>
            <TextBlock size={"base"}>{text}</TextBlock>
          </View>
        }
        <Grid columns={["auto", "auto", "auto"]} rows={"auto"} spacing={"tight"} blockAlignment={"center"}>
          {stars && (
            <View maxInlineSize={80}>
              <Image fit="contain" source={stars} cornerRadius="none" />
            </View>
          )}
          <Text size={"small"}>{author}</Text>
          <Text size={"extraSmall"} appearance={"subdued"}>
            {date}
          </Text>
        </Grid>
      </BlockStack>
    </Grid>
  );
}
