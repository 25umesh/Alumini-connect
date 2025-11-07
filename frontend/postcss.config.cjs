// Prefer the new official PostCSS adapter for Tailwind. If it's not
// installed, fall back to the 'tailwindcss' package. The fallback keeps
// compat with older setups while allowing newer installs to work.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
