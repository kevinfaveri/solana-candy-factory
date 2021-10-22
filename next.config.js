const withTM = require('next-transpile-modules')([
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-react',
  '@civic/solana-gateway-react']
);
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');

const plugins = [
  withTM,
  withImages
]

/** @type {import('next').NextConfig} */
module.exports = withPlugins(plugins, {
  reactStrictMode: true,
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false, os: false, path: false, crypto: false };

    return config;
  }
})