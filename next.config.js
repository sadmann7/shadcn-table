// import million from "million/compiler"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
}

// const millionConfig = {
//   auto: { rsc: true },
// }

// TODO: Add back millionConfig once it's fixed
// export default million.next(nextConfig, millionConfig)
export default nextConfig
