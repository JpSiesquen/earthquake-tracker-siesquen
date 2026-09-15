# MapLibre sandbox

Standalone browser fixture for the MapLibre integration, isolated from the React application.
It uses the patched MapLibre GL JS `6.9.1` ESM bundle from UNPKG, aligned with the
product dependency.

From the repository root, start a static HTTP server:

```bash
python -m http.server 4173
```

Open <http://localhost:4173/sandbox/maplibre/>.
