import {
  reactExtension,
  Image,
  useSettings,
  InlineStack,
  Spacing,
  View,
  Alignment
} from "@shopify/ui-extensions-react/checkout";
import { displayDesktopStyle, displayMobileStyle, normalizeImageSize } from "lib/utils";

export default reactExtension("purchase.checkout.header.render-after", () => <Extension />);

interface settings {
  source?: string;
  source_mb?: string;
  inline_size?: number;
  inline_size_mb?: number;
  inline_position?: Alignment;
  padding_block?: Spacing;
  padding_inline?: Spacing;
}

function Extension() {
  const {
    source,
    source_mb,
    inline_size,
    inline_size_mb,
    inline_position = "start",
    padding_block,
    padding_inline
  }: settings = useSettings();

  return (
    <InlineStack padding={[padding_block, padding_inline]} inlineAlignment={inline_position}>
      {[
        { imgSource: source, style: displayDesktopStyle, size: inline_size },
        { imgSource: source_mb, style: displayMobileStyle, size: inline_size_mb }
      ].map(
        ({ style, imgSource, size }, index) =>
          imgSource && (
            <View key={index} display={style} maxInlineSize={normalizeImageSize(size, 600)}>
              <Image fit="contain" source={imgSource} cornerRadius="none" />
            </View>
          )
      )}
    </InlineStack>
  );
}
