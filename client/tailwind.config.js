/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'nukkad-orange': '#ff9f1c',
                'nukkad-green': '#2ec4b6',
                'nukkad-blue': '#011627',
            }
        },
    },
    plugins: [],
}
