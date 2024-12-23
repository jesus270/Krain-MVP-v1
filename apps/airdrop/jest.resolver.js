module.exports = (path, options) => {
  // Handle ESM modules that need to be transformed
  const esmModules = [
    "uuid",
    "@solana/web3.js",
    "@solana/buffer-layout",
    "superstruct",
    "@noble",
    "node-fetch",
    "web-encoding",
    "@project-serum",
    "borsh",
    "buffer",
    "bn.js",
    "bs58",
    "rpc-websockets",
    "eventemitter3",
    "ws",
  ];

  if (esmModules.some((mod) => path.startsWith(mod))) {
    return options.defaultResolver(path.replace(/\.js$/, ""), {
      ...options,
      packageFilter: (pkg) => {
        // Convert ESM packages to CommonJS
        if (pkg.type === "module") {
          pkg.type = "commonjs";
          // Handle different export formats
          if (pkg.exports) {
            const exports = pkg.exports;
            if (typeof exports === "string") {
              pkg.main = exports;
            } else if (exports.require) {
              pkg.main = exports.require;
            } else if (exports.default) {
              pkg.main = exports.default;
            } else if (exports["."]) {
              pkg.main =
                exports["."].require || exports["."].default || exports["."];
            } else if (exports.node) {
              pkg.main =
                exports.node.require || exports.node.default || exports.node;
            }
          }
          // If no main field is set after trying exports, use a default
          if (!pkg.main && pkg.module) {
            pkg.main = pkg.module;
          }
        }
        return pkg;
      },
    });
  }

  // For all other modules, use the default resolver
  return options.defaultResolver(path, options);
};
