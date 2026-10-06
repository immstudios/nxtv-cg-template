import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Two build passes produce two independent JS bundles from the same
// source (see package.json's "build" script):
//   - default mode: src/main.tsx -> nxtv.ograf.js, a real ES module
//     (`export default` custom element) for OGraf-compliant renderers to
//     import over http(s). Built in library mode: Vite's default app
//     build assumes the entry has no meaningful exports and prunes them,
//     which silently strips the `export default` an OGraf host needs.
//   - --mode amcp:  src/amcp.tsx -> nxtv.amcp.js, a classic IIFE script
//     for CasparCG's HTML producer, which loads templates via file://,
//     where an external type="module" script is not eligible: browsers
//     refuse to fetch those over the file:// protocol.
// Both read public/manifest.ograf.json and public/nxtv.html verbatim.
export default defineConfig(({ mode, command }) => {
  const isAmcp = mode === 'amcp'

  return {
    plugins: [
      react(),
    ],
    // Relative asset/script URLs in the *build* output: CasparCG loads
    // templates from an arbitrary directory (often file://), and OGraf
    // hosts import the bundle from wherever the package sits — neither
    // has a stable root. Dev server needs the default absolute base — it
    // serves its own internal endpoints (/@react-refresh, /@vite/client,
    // HMR) at a fixed absolute mount path.
    base: command === 'build' ? './' : '/',
    // Library mode skips this by default, on the assumption a published
    // library gets re-bundled by its consumer, who defines NODE_ENV
    // themselves. These bundles are terminal — loaded directly by a
    // browser, never re-bundled — so without this React ships its bloated
    // development build (with all its runtime warnings) instead. Build
    // only: forcing this in dev breaks Vite's own dev-only tooling (React
    // Fast Refresh's runtime is itself gated on NODE_ENV !== 'production').
    define: command === 'build' ? {
      'process.env.NODE_ENV': JSON.stringify('production'),
    } : {},
    build: {
      minify: true,
      target: 'es2015',
      emptyOutDir: !isAmcp,
      // Force the bundled font files (~16-33KB) to base64-inline into the
      // CSS text rather than emit as separate files with a relative
      // url(): that CSS ends up injected into a <style> tag inside
      // whatever document/shadow-root a host places the graphic in, and
      // a relative url() there resolves against the HOST's document URL,
      // not ours — a data: URI needs no such resolution at all.
      assetsInlineLimit: 100_000,
      lib: {
        entry: isAmcp ? 'src/amcp.tsx' : 'src/main.tsx',
        formats: [isAmcp ? 'iife' : 'es'],
        // iife requires a global variable name even though nothing reads it.
        name: isAmcp ? '__nxtvAmcpBundle' : undefined,
        // manifest.ograf.json's "main" and public/nxtv.html's <script>
        // both point at these exact filenames.
        fileName: () => isAmcp ? 'nxtv.amcp.js' : 'nxtv.ograf.js',
      },
    }
  }
})
