// /** @type {import('tailwindcss').Config} */
// export default {
//     content: [
//         "./index.html",
//         "./src/**/*.{js,ts,jsx,tsx}",
//     ],
//     theme: {
//         extend: {
//             fontFamily: {
//                 serif: ['Merriweather', 'serif'],
//                 sans: ['Open Sans', 'sans-serif'],
//             },
//             colors: {
//                 primary: '#2563eb',
//                 primaryDark: '#1d4ed8',
//                 surface: '#f8f7f4',
//                 border: '#ebebeb',
//             }
//         },
//     },
//     plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Merriweather', 'serif'],
                sans: ['Open Sans', 'sans-serif'],
            },
            colors: {
                primary: '#2563eb',
                primaryDark: '#1d4ed8',
                surface: '#f8f7f4',
                border: '#ebebeb',
            }
        },
    },
    plugins: [],
}