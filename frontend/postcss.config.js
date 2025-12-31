const tailwind = require('@tailwindcss/postcss')

module.exports = {
  plugins: [tailwind()],   // 👈 call the factory
}