import type { NextConfig } from "next";
const withTM = require("next-transpile-modules")([
  "rc-util",
  "rc-tree",
  "rc-table",
  "rc-input",
  "rc-pagination",
  "rc-picker",
  "@rc-component/util",
  "@ant-design/icons",
  "@ant-design/icons-svg",
]);


const nextConfig: NextConfig = withTM({
  /* config options here */
  reactStrictMode: true,
});

export default nextConfig;
