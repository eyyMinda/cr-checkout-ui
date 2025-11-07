import {
  reactExtension,
  useSettings,
  Spacing,
  TextBlock,
  Text,
  InlineStack,
  InlineAlignment
} from "@shopify/ui-extensions-react/checkout";
import { Emphasis, TextSize } from "@shopify/ui-extensions/src/surfaces/checkout/components/shared";

export default reactExtension("purchase.checkout.block.render", () => <Extension />);

interface settings {
  text?: string;
  text_block?: string;
  text_align?: InlineAlignment;
  text_size?: TextSize;
  text_style?: Emphasis | "normal";
  text_appearance?: TextAppearance | "normal";
  padding_block?: Spacing;
  padding_inline?: Spacing;
}

function Extension() {
  const {
    text,
    text_block,
    text_align,
    text_size,
    text_style,
    text_appearance,
    padding_block,
    padding_inline
  }: settings = useSettings();

  const attributes = { size: text_size };
  if (text_style !== "normal") attributes["emphasis"] = text_style;
  if (text_appearance !== "normal") attributes["appearance"] = text_appearance;

  return (
    <InlineStack inlineAlignment={text_align} padding={[padding_block, padding_inline]}>
      {text_block ? <TextBlock {...attributes}>{text_block}</TextBlock> : <Text {...attributes}>{text}</Text>}
    </InlineStack>
  );
}

type TextAppearance = "accent" | "subdued" | "info" | "success" | "warning" | "critical" | "decorative";
