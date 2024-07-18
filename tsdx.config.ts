const replace = require('@rollup/plugin-replace');

module.exports = {
  rollup(config, options) {
    const replacePluginIndex = config.plugins.findIndex(
      plugin => plugin.name === 'replace'
    );
    if (replacePluginIndex !== -1) {
      config.plugins[replacePluginIndex] = replace({
        preventAssignment: true,
        ...config.plugins[replacePluginIndex].options,
      });
    }
    return config;
  },
};
