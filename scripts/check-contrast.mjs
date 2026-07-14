import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(currentDir, "../src/styles/tokens.css");
const css = readFileSync(tokensPath, "utf8");

function extractBlock(startMarker, endMarker) {
  const start = css.indexOf(startMarker);
  const end = endMarker ? css.indexOf(endMarker, start) : css.length;
  if (start < 0 || end < 0) throw new Error(`Theme block not found: ${startMarker}`);
  return css.slice(start, end);
}

function readHexToken(block, token) {
  const match = block.match(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Hex token not found: --${token}`);
  return match[1];
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => Number.parseInt(value, 16) / 255)
    .map((value) =>
      value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4,
    );

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lightest = Math.max(foregroundLuminance, backgroundLuminance);
  const darkest = Math.min(foregroundLuminance, backgroundLuminance);
  return (lightest + 0.05) / (darkest + 0.05);
}

const themes = {
  light: extractBlock(":root {", "\n.dark {"),
  dark: extractBlock(".dark {"),
};

const checks = [
  ["text / background", "text", "bg", 4.5],
  ["muted text / background", "muted", "bg", 4.5],
  ["primary text / background", "primary", "bg", 4.5],
  ["secondary text / background", "secondary", "bg", 4.5],
  ["light accent / background", "accent-cyan", "bg", 4.5],
  ["navy/silver accent / background", "accent-teal", "bg", 4.5],
  ["alternate light accent / background", "accent-indigo", "bg", 4.5],
  ["alternate dark accent / background", "accent-violet", "bg", 4.5],
  ["steel/silver accent / background", "accent-steel", "bg", 4.5],
  ["text / raised surface", "text", "surface-raised", 4.5],
  ["muted text / raised surface", "muted", "surface-raised", 4.5],
  ["button text / primary", "on-primary", "primary", 4.5],
  ["button text / strong primary", "on-primary", "primary-strong", 4.5],
  ["structural line / background", "line", "bg", 3],
  ["structural line / raised surface", "line", "surface-raised", 3],
  ["focus ring / background", "focus-ring", "bg", 3],
  ["focus ring / raised surface", "focus-ring", "surface-raised", 3],
];

let failed = false;

for (const [themeName, block] of Object.entries(themes)) {
  console.log(`\n${themeName.toUpperCase()} THEME`);
  for (const [label, foregroundToken, backgroundToken, minimum] of checks) {
    const foreground = readHexToken(block, foregroundToken);
    const background = readHexToken(block, backgroundToken);
    const ratio = contrast(foreground, background);
    const passes = ratio >= minimum;
    failed ||= !passes;
    console.log(
      `${passes ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1  ${label} (minimum ${minimum}:1)`,
    );
  }
}

const satinSilver = readHexToken(themes.light, "satin-silver");
const satinBlack = readHexToken(themes.light, "satin-black");
const satinRatio = contrast(satinSilver, satinBlack);
const satinPasses = satinRatio >= 4.5;
failed ||= !satinPasses;
console.log(`\nSATIN NEUTRALS`);
console.log(
  `${satinPasses ? "PASS" : "FAIL"}  ${satinRatio.toFixed(2)}:1  satin silver / satin black (minimum 4.5:1)`,
);

if (failed) {
  console.error("\nOne or more color pairs do not meet the configured WCAG threshold.");
  process.exit(1);
}

console.log("\nAll audited color pairs meet the configured WCAG thresholds.");
