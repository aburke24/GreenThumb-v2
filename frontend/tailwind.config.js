/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  
  // Extend the default Tailwind theme
  theme: {
    extend: {
      // Add the custom 'Inter' font to the sans-serif family
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // Define your custom color palette here
      colors: {
        'garden-green': '#257743ff',   // A vibrant green for main accents
        'soil-brown': '#401608ff',     // A rich brown for text or backgrounds
        'accent-blue': '#3B82F6',   // A blue for buttons or links
        'light-gray': '#F9FAFB',   // A soft gray for backgrounds
      },
    },
  },
  
  // No custom plugins are needed for the current design
  plugins: [],
}