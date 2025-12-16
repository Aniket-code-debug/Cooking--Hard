/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E6EF4',
                    hover: '#4A8BFF',
                    active: '#1557C7',
                },
                accent: {
                    DEFAULT: '#AF52DE',
                    hover: '#C46EE8',
                },
                'bg-dark': '#1C1C1E',
                'surface-dark': '#2C2C2E',
                'surface-elevated': '#3A3A3C',
            },
            fontFamily: {
                sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
