const config = {
  use: {
    launchOptions: {
      // force GPU hardware acceleration
      // (even in headless mode)
      args: ['--use-gl=desktop'],
    },
  },
};

module.exports = config;
