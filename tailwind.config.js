/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'solar-orange': '#F5A623',
        'solar-orange-hover': '#E09000',
        'solar-blue': '#1E3A5F',
        'solar-gray': '#F5F5F5',
      },
    },
  },
  plugins: [],
}
