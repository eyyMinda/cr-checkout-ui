import { Style, Display, MaybeResponsiveConditionalStyle } from "@shopify/ui-extensions-react/checkout";
import { CHECKOUT_SCREEN_BREAKPOINT } from "./constants";

export const displayDesktopStyle: MaybeResponsiveConditionalStyle<Display> = Style.default<Display>("none").when(
  { viewportInlineSize: { min: "medium" } },
  "block"
);
export const displayMobileStyle: MaybeResponsiveConditionalStyle<Display> = Style.default<Display>("block").when(
  { viewportInlineSize: { min: "medium" } },
  "none"
);
export const displayDesktopStyleAuto: MaybeResponsiveConditionalStyle<"none" | "auto"> = Style.default<"none" | "auto">(
  "none"
).when({ viewportInlineSize: { min: "medium" } }, "auto");
export const displayMobileStyleAuto: MaybeResponsiveConditionalStyle<"none" | "auto"> = Style.default<"none" | "auto">(
  "auto"
).when({ viewportInlineSize: { min: "medium" } }, "none");

// Debounce utility
export function debounce(func: () => void, wait: number): () => void {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
}
export const normalizeImageSize = (size: number | undefined, defaultSize: number = 80): number =>
  size && size >= 10 ? size : defaultSize;

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  return `${pad(minutes)} : ${pad(remainingSeconds)}`;
};

/**
 Centralized logger function
  @usage const DEBUG = true;
          const { log, error } = logger(DEBUG);
  @param DEBUG - Whether to log messages
  @returns An object with log and error methods
*/
export const logger = (DEBUG: boolean) => ({
  log: (section: string, message: any, ...args: any[]) => {
    if (DEBUG) console.log(`[${section}] ${message}`, ...args);
  },
  error: (section: string, message: string, ...args: any[]) => {
    if (DEBUG) console.error(`[${section}] ${message}`, ...args);
  }
});
