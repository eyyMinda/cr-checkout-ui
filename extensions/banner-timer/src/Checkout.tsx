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
import { displayMobileStyle, displayDesktopStyle, formatTime, normalizeImageSize } from "lib/utils";
import { useEffect, useState } from "react";
export default reactExtension("purchase.checkout.header.render-after", () => <Extension />);

interface settings {
  container_alignment?: Alignment;
  background?: Background;
  border?: BorderStyle;
  borderWidth?: BorderWidth;
  borderRadius?: CornerRadius;
  blockAlignment?: Alignment;
  spacing?: Spacing;
  padding_block?: Spacing;
  padding_inline?: Spacing;
  icon_source?: string;
  icon_width?: number;
  title?: string;
  text?: string;
  time?: number;
}

function Extension() {
  const {
    container_alignment,
    background,
    border,
    borderWidth,
    borderRadius,
    blockAlignment,
    spacing,
    padding_block,
    padding_inline,
    icon_source,
    icon_width,
    title,
    text,
    time = 900
  }: settings = useSettings();
  const [timer, setTimer] = useState(time || 900);

  useEffect(() => {
    const interval = setInterval(() => setTimer(prev => Math.max(prev - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const attributes = {
    columns: ["auto", "fill"] as Columns,
    rows: "auto" as Rows,
    blockAlignment,
    spacing,
    background,
    border,
    borderRadius,
    borderWidth,
    padding: [padding_block || "none", padding_inline] as [Spacing, Spacing]
  };

  const renderContent = () => {
    return (
      <>
        <Grid columns={["auto", "auto"]} rows={"auto"} spacing={"tight"} blockAlignment={"center"}>
          <Text size={"base"} emphasis={"bold"}>
            {title}
          </Text>

          <View background={"subdued"} border={"base"} borderRadius={"base"} padding={["none", "extraTight"]}>
            {formatTime(timer)}
          </View>
        </Grid>

        <View display={displayDesktopStyle}>
          <TextBlock size={"base"}>{text}</TextBlock>
        </View>
        <View display={displayMobileStyle}>
          <TextBlock size={"small"}>{text}</TextBlock>
        </View>
      </>
    );
  };

  return icon_source ? (
    <Grid {...attributes} id="banner-timer-wrapper" inlineAlignment={container_alignment}>
      <View maxInlineSize={normalizeImageSize(icon_width)} minInlineSize={normalizeImageSize(icon_width)}>
        <Image fit="cover" source={icon_source} aspectRatio={1} cornerRadius={"fullyRounded"} />
      </View>
      <BlockStack spacing={"extraTight"}>{renderContent()}</BlockStack>
    </Grid>
  ) : (
    <BlockStack {...attributes} spacing={"extraTight"} id="banner-timer-wrapper" inlineAlignment={container_alignment}>
      {renderContent()}
    </BlockStack>
  );
}
