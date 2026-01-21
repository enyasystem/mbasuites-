/* PostCSS config (CommonJS) — dynamically load Tailwind's PostCSS plugin.
   Tries '@tailwindcss/postcss' first (new plugin package), then falls back
   to 'tailwindcss' (older behaviour). This avoids ESM subpath import issues
   when a package doesn't export './postcss'.
*/
const autoprefixer = require('autoprefixer');

let tailwindPlugin;
try {
  // Preferred new package if available
  tailwindPlugin = require('@tailwindcss/postcss');
} catch (err) {
  // Fallback to the tailwindcss package itself
  try {
    tailwindPlugin = require('tailwindcss');
  } catch (err2) {
    // Re-throw the original (preferred) error to show helpful message
    throw err;
  }
}

module.exports = {
  plugins: [
    tailwindPlugin(),
    autoprefixer(),
  ],
};
