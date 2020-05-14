const bundleAnalyzer = require('@next/bundle-analyzer');
const PRODUCTION_PROFILING = process.env.PROFILING === 'true';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  webpack(config, meta) {
    const { buildId, dev, isServer, defaultLoaders, webpack } = meta;

    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        test: /\.(js|ts)x?$/,
      },
      loader: 'svg-sprite-loader',
    });

    if (PRODUCTION_PROFILING && !dev) {
      const alias = config.resolve.alias;
      alias['react-dom$'] = 'react-dom/profiling';
      alias['scheduler/tracing'] = 'scheduler/tracing-profiling';
    }

    return config;
  },
});
