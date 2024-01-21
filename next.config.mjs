import million from "million/compiler"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs")

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
}

const millionConfig = {
  auto: { rsc: true },
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
export default million.next(nextConfig, millionConfig)
