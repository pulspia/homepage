/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class', // 다크 모드 활성화
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Malgun Gothic"', ...fontFamily.sans], // 기본 폰트 설정
      },
    },
  },
  plugins: [],
}
