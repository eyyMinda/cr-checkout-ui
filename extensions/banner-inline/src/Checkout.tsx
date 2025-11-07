import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { Appearance, Background, BorderStyle, CornerRadius, Spacing } from "@shopify/ui-extensions-react/checkout";
import { formatTime, normalizeImageSize } from "../../../lib/utils";
import {
  ReducedAlignItemsKeyword,
  ReducedBorderSizeKeyword,
  ReducedJustifyItemsKeyword
} from "@shopify/ui-extensions/build/ts/surfaces/checkout/components/Grid";

// ============================================================================
// Utils
// ============================================================================

/**
 * Parse text with HTML-like tags for Preact extensions (returns JSX elements)
 * Supports: <i> for italic, <strong> for bold, <span> for critical tone
 */
function parseTextWithTagsPreact(text: string): any {
  if (!text) return null;

  function parse(str: string, start: number = 0): { pos: number; result: any[] } {
    const result: any[] = [];
    let i = start;

    while (i < str.length) {
      const tagMatch = str.substring(i).match(/^<(\/?)(i|strong|span)>/i);

      if (tagMatch) {
        const isClosing = tagMatch[1] === "/";
        const tagName = tagMatch[2].toLowerCase();
        const tagLength = tagMatch[0].length;

        if (isClosing) {
          return { pos: i + tagLength, result };
        } else {
          const inner = parse(str, i + tagLength);

          let wrapped: any;
          switch (tagName) {
            case "i":
              wrapped = <s-text type="emphasis">{inner.result}</s-text>;
              break;
            case "strong":
              wrapped = <s-text type="strong">{inner.result}</s-text>;
              break;
            case "span":
              // Span always uses critical tone
              wrapped = <s-text tone="critical">{inner.result}</s-text>;
              break;
            default:
              wrapped = inner.result;
          }

          result.push(wrapped);
          i = inner.pos;
        }
      } else {
        const nextTag = str.substring(i).search(/<[\/]?(i|strong|span)>/i);

        if (nextTag === -1) {
          if (i < str.length) {
            result.push(str.substring(i));
          }
          break;
        } else {
          if (nextTag > 0) {
            result.push(str.substring(i, i + nextTag));
          }
          i += nextTag;
        }
      }
    }

    return { pos: i, result };
  }

  const parsed = parse(text);
  return parsed.result.length === 1 ? parsed.result[0] : parsed.result;
}

// ============================================================================
// Types
// ============================================================================

interface Settings {
  text_block?: string;
  text_block_2?: string;
  timer_time?: number;
  background_color?: Background;
  border_style?: BorderStyle;
  border_width?: ReducedBorderSizeKeyword;
  border_radius?: CornerRadius;
  padding_block?: Spacing;
  padding_inline?: Spacing;
  text_color?: Appearance;
  icon_source?: string;
  icon_width?: number;
  banner_align_horizontal?: ReducedJustifyItemsKeyword;
  banner_align_vertical?: ReducedAlignItemsKeyword;
}

// ============================================================================
// Component
// ============================================================================

function Extension() {
  const settings = shopify.settings.value as Settings;

  // Get settings with defaults and proper type casting
  const iconSource = settings?.icon_source;
  const iconWidth = normalizeImageSize(settings?.icon_width, 80);

  // Use default translations only if both text blocks are empty, otherwise use settings values
  const settingsTextBlock = settings?.text_block as string;
  const settingsTextBlock2 = settings?.text_block_2 as string;
  const bothEmpty =
    (!settingsTextBlock || settingsTextBlock.trim().length === 0) &&
    (!settingsTextBlock2 || settingsTextBlock2.trim().length === 0);

  const textBlock = bothEmpty ? shopify.i18n.translate("defaultText") : settingsTextBlock || "";
  const textBlock2 = bothEmpty ? shopify.i18n.translate("defaultText2") : settingsTextBlock2 || "";
  const timerTime = parseInt(String(settings?.timer_time || 900), 10);
  const bannerAlignHorizontal =
    (settings?.banner_align_horizontal as ReducedJustifyItemsKeyword) || ("center" as ReducedJustifyItemsKeyword);
  const bannerAlignVertical =
    (settings?.banner_align_vertical as ReducedAlignItemsKeyword) || ("center" as ReducedAlignItemsKeyword);
  const textColor = (settings?.text_color as Appearance) || ("base" as Appearance);
  const backgroundColor = (settings?.background_color as Background) || ("base" as Background);
  const borderStyle = (settings?.border_style as BorderStyle) || ("base" as BorderStyle);
  const borderWidth = (settings?.border_width as ReducedBorderSizeKeyword) || ("base" as ReducedBorderSizeKeyword);
  const borderRadius = (settings?.border_radius as CornerRadius) || ("base" as CornerRadius);
  const paddingBlock = (settings?.padding_block as Spacing) || ("base" as Spacing);
  const paddingInline = (settings?.padding_inline as Spacing) || ("base" as Spacing);

  // Timer state
  const timer = useSignal(timerTime);
  useEffect(() => {
    if (timer.value <= 0) return;
    const interval = setInterval(() => {
      timer.value = Math.max(timer.value - 1, 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse text with tags
  const parsedText = parseTextWithTagsPreact(textBlock);
  const parsedText2 = textBlock2 ? parseTextWithTagsPreact(textBlock2) : null;

  const stackProps = {
    background: backgroundColor,
    borderStyle: borderStyle,
    borderWidth: borderWidth,
    borderRadius: borderRadius,
    paddingBlock: paddingBlock,
    paddingInline: paddingInline,
    gap: "base" as const
  };

  const gridProps = {
    gridTemplateColumns: iconSource ? `${iconWidth}px auto` : "auto",
    justifyItems: bannerAlignHorizontal,
    alignItems: bannerAlignVertical,
    gap: "base" as const
  };

  // Text props - apply tone if not base
  const textProps: any = {};
  if (textColor !== "base") textProps.tone = textColor;

  // Render content (text + timer)
  // If text_block_2 is not empty: text_block_1 on line 1, text_block_2 + timer on line 2
  // Otherwise: text_block_1 + timer on one line
  const timerText = formatTime(timer.value);
  const hasTextBlock2 = textBlock2 && textBlock2.trim().length > 0;

  const content = hasTextBlock2 ? (
    // Two lines: text_block_1 on first line, text_block_2 + timer on second line
    <s-stack gap="none">
      <s-text {...textProps}>{parsedText || textBlock}</s-text>
      <s-text {...textProps}>
        {parsedText2} <s-text type="strong">{timerText}</s-text>
      </s-text>
    </s-stack>
  ) : (
    // One line: text_block_1 + timer
    <s-text {...textProps}>
      {parsedText || textBlock} <s-text type="strong">{timerText}</s-text>
    </s-text>
  );

  return (
    // @ts-ignore - Preact types are stricter, but values are validated in settings
    <s-stack {...stackProps}>
      {iconSource ? (
        <s-grid {...gridProps}>
          <s-box inlineSize={`${iconWidth}px`}>
            <s-image src={iconSource} inlineSize="fill" aspectRatio="1" borderRadius="max" />
          </s-box>
          {content}
        </s-grid>
      ) : (
        content
      )}
    </s-stack>
  );
}

// ============================================================================
// Entry Point
// ============================================================================

export default async () => {
  render(<Extension />, document.body);
};
