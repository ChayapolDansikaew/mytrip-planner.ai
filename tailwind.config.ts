const config = {
  theme: {
    extend: {
      keyframes: {
        "slide-up": {
          "0%": { transform: "translate(-50%, 100%)", opacity: "0" },
          "100%": { transform: "translate(-50%, 0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
};

export default config;
