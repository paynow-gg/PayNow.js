export default typeof window === "undefined"
  ? {
      document: {
        body: {},
      },
    }
  : window;
