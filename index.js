// Entry point fallback for hosts (e.g. Render) that default to `node index.js`.
// The real server is the compiled TypeScript output in dist/.
require("./dist/server.js");
