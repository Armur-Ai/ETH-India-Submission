/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      black: "#000",
      transparentBlack: "rgba(0, 0, 0, 0.48)",
      white: "#fff",
      blue: "#29abe2",
      blueTitle: "#00E5FF",
      blueSecondary: "#1f789e",
      blueGray: {
        200: "#000f1d",
        250: "#00202E",
        600: "#071f29",
        700: "#13232A",
      },
      cyan: {
        200: "#a0f6ff",
        300: "#81f2ff",
      },
      gray: {
        100: "#000c14",
        150: "#00142f",
        200: "#000e10",
        300: "#00191d",
        400: "rgb(7 31 41)",
        500: "#242424",
        900: "#4E4E4E",
      },
      red: {
        600: "#DC2626",
      },
      brown: {
        500: "#4f4f4f",
      },
      zinc:{
        400: '#A1A1AA'
      },
    },
    fontFamily: {
      header: ["Conthrax", "serif"],
      headerSemiBold: ["ConthraxSemiBold", "serif"],
      glitch: ["GlitchInside", "sans-serif"],
      bodyExtraLight: ["Oxanium-ExtraLight", "serif"],
      bodyLight: ["Oxanium-Light", "serif"],
      body: ["Oxanium-Regular", "serif"],
      bodyBold: ["Oxanium-Bold", "serif"],
      bodySemiBold: ["Oxanium-SemiBold", "serif"],
    },
  },
  plugins: [],
}
