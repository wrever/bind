# Bind — kit de logo (producción)

Fuente de los assets cableados en la app. Sitio oscuro (`#0E100D`) → solo variantes `-dark`.

## SVG (`svg/`)
| archivo | uso |
|---|---|
| `bind-logo-horizontal-sm-dark.svg` | header / footer (~28–32 px de alto) |
| `bind-logo-horizontal-dark.svg` | hero / lockup grande (≥64 px) |
| `bind-mark-sm-dark.svg` | símbolo &lt;48 px |
| `bind-mark-dark.svg` | símbolo ≥48 px |

Copias en `public/brand/`. Alineá por el asta del B (offset óptico del cometa):
- `horizontal-sm`: `margin-left: calc(-0.239 * alto)`
- `horizontal`: `margin-left: calc(-0.407 * alto)`

## Favicon / PWA / OG
| fuente | destino |
|---|---|
| `favicon/favicon.ico` | `src/app/favicon.ico` |
| `favicon/favicon.svg` | `src/app/icon.svg` |
| `favicon/apple-touch-icon.png` | `src/app/apple-icon.png` |
| `favicon/icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | `public/` |
| `favicon/site.webmanifest` | `public/site.webmanifest` |
| `social/og-image.png` (1200×630) | `public/og-image.png` |

No hay carpeta `png/` ni variantes light/mono en este kit: la UI usa SVG.
