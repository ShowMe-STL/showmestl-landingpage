# Liquid Glass Navbar Background — Portable AI Handoff

This document packages a reusable liquid-glass **background treatment** for a pill-shaped navbar. It is intentionally independent of any brand, logo, navigation labels, CTA, page structure, or scroll animation.

Use the receiving project's existing navbar markup and behavior. Add only the glass surface, SVG refraction filter, fallback blur, and specular edge described here.

## Agent brief

Implement this effect as the background of an existing or new pill-shaped navbar:

- A `#28282B` tint at 50% opacity.
- A responsive SVG displacement map that optically bends the page behind the navbar.
- A conventional blur/saturation fallback when SVG backdrop filters are unsupported.
- A smooth, CSS-rendered specular edge that stays outside the rasterized warp pipeline.
- No continuous border and no broad white sheen across the interior.
- The current specular treatment is 0.5 CSS pixels thick, peaks at 25% white opacity, and is brightest along the top and bottom edges.
- The displacement map is rendered at up to 2× device-pixel density to avoid visible pixelation.
- The implementation assumes one pill-shaped glass navbar per document.

Do not copy any product-specific content from the source project. Preserve the target project's navbar content, accessibility, responsiveness, routing, and animation behavior.

## Architecture

The effect has three deliberately separate layers:

1. **Fallback glass:** translucent tint plus CSS `backdrop-filter: blur(...) saturate(...)`.
2. **Chromium refraction:** a generated high-DPI displacement texture supplied to an SVG `feDisplacementMap` and applied through `backdrop-filter: url(...)`.
3. **Specular edge:** a CSS masked pseudo-element rendered above the filter at native compositor resolution.

Keeping the specular edge out of the SVG texture is important. Baking it into the canvas displacement map causes the highlight to look pixelated on high-density displays.

## Browser behavior

- Chromium browsers receive the SVG refraction effect when supported.
- Safari, Firefox, and other unsupported browsers retain the translucent blur/saturation fallback.
- `prefers-reduced-transparency` disables both backdrop treatments and uses a nearly opaque surface.
- The SVG filter is an enhancement. Navbar content and interaction must not depend on it.

The underlying SVG-backdrop technique is currently Chromium-specific. Conceptual references:

- <https://kube.io/blog/liquid-glass-css-svg/>
- <https://github.com/winaviation/liquid-glass-demo>

## File 1: `liquid-glass-filter.tsx`

This is framework-neutral React code except for the `'use client'` directive, which is required in a Next.js App Router project and harmless in a standard client React build.

```tsx
'use client'

import * as React from 'react'

export const LIQUID_GLASS_FILTER_ID = 'liquid-glass-navbar-refraction'

export type LiquidGlassMap = {
  width: number
  height: number
  displacementUrl: string
  scale: number
}

const convexSquircle = (x: number) =>
  Math.pow(1 - Math.pow(1 - x, 4), 1 / 4)

function calculateDisplacementProfile(
  glassThickness: number,
  bezelWidth: number,
  samples = 128,
) {
  const eta = 1 / 1.5
  const profile: number[] = []

  for (let index = 0; index < samples; index += 1) {
    const x = index / samples
    const height = convexSquircle(x)
    const delta = x < 1 ? 0.0001 : -0.0001
    const nextHeight = convexSquircle(Math.max(0, Math.min(1, x + delta)))
    const derivative = (nextHeight - height) / delta
    const normalLength = Math.hypot(derivative, 1)
    const normalX = -derivative / normalLength
    const normalY = -1 / normalLength
    const k = 1 - eta * eta * (1 - normalY * normalY)

    if (k < 0) {
      profile.push(0)
      continue
    }

    const refractionFactor = eta * normalY + Math.sqrt(k)
    const refractedX = -refractionFactor * normalX
    const refractedY = eta - refractionFactor * normalY
    const remainingHeight = height * bezelWidth + glassThickness

    profile.push(
      Math.abs(refractedY) > 0.0001
        ? refractedX * (remainingHeight / refractedY)
        : 0,
    )
  }

  return profile
}

function pillNormal(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const horizontalSpan = width - radius * 2
  const verticalSpan = height - radius * 2
  const normalX =
    x < radius
      ? x - radius
      : x >= width - radius
        ? x - radius - horizontalSpan
        : 0
  const normalY =
    y < radius
      ? y - radius
      : y >= height - radius
        ? y - radius - verticalSpan
        : 0

  return { normalX, normalY, distance: Math.hypot(normalX, normalY) }
}

function createDisplacementMap(
  width: number,
  height: number,
  radius: number,
  bezelWidth: number,
  profile: number[],
  maximumDisplacement: number,
) {
  const imageData = new ImageData(width, height)

  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    imageData.data[offset] = 128
    imageData.data[offset + 1] = 128
    imageData.data[offset + 2] = 0
    imageData.data[offset + 3] = 255
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const { normalX, normalY, distance } = pillNormal(
        x + 0.5,
        y + 0.5,
        width,
        height,
        radius,
      )
      const distanceFromSide = radius - distance

      if (distance > radius + 1 || distanceFromSide > bezelWidth) continue

      const edgeOpacity =
        distance <= radius ? 1 : Math.max(0, 1 - (distance - radius))
      const bezelRatio = Math.max(
        0,
        Math.min(1, distanceFromSide / bezelWidth),
      )
      const opticalBezelRatio = Math.pow(bezelRatio, 1.4)
      const profileIndex = Math.min(
        profile.length - 1,
        Math.floor(opticalBezelRatio * profile.length),
      )
      const displacement = profile[profileIndex] ?? 0
      const directionX = distance > 0 ? normalX / distance : 0
      const directionY = distance > 0 ? normalY / distance : 0
      const normalizedX =
        maximumDisplacement > 0
          ? (-directionX * displacement) / maximumDisplacement
          : 0
      const normalizedY =
        maximumDisplacement > 0
          ? (-directionY * displacement) / maximumDisplacement
          : 0
      const offset = (y * width + x) * 4

      imageData.data[offset] = Math.max(
        0,
        Math.min(255, 128 + normalizedX * 127 * edgeOpacity),
      )
      imageData.data[offset + 1] = Math.max(
        0,
        Math.min(255, 128 + normalizedY * 127 * edgeOpacity),
      )
    }
  }

  return imageData
}

function imageDataToUrl(imageData: ImageData) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const context = canvas.getContext('2d')

  if (!context) return ''
  context.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function createLiquidGlassMap(
  width: number,
  height: number,
  pixelRatio: number,
): LiquidGlassMap {
  const rasterScale = Math.min(2, Math.max(1, pixelRatio))
  const rasterWidth = Math.round(width * rasterScale)
  const rasterHeight = Math.round(height * rasterScale)
  const radius = rasterHeight / 2
  const bezelWidth = radius * 0.9
  const profile = calculateDisplacementProfile(32 * rasterScale, bezelWidth)
  const maximumDisplacement = Math.max(...profile.map(Math.abs))

  return {
    width,
    height,
    displacementUrl: imageDataToUrl(
      createDisplacementMap(
        rasterWidth,
        rasterHeight,
        radius,
        bezelWidth,
        profile,
        maximumDisplacement,
      ),
    ),
    scale: Math.min(30, (maximumDisplacement / rasterScale) * 0.72),
  }
}

export function useLiquidGlassFilter(
  targetRef: React.RefObject<HTMLElement | null>,
) {
  const [map, setMap] = React.useState<LiquidGlassMap | null>(null)

  React.useEffect(() => {
    const isChromium = 'chrome' in window
    const supportsSvgBackdrop =
      typeof CSS !== 'undefined' &&
      CSS.supports('backdrop-filter', `url(#${LIQUID_GLASS_FILTER_ID})`)

    if (!isChromium || !supportsSvgBackdrop) return

    let animationFrame = 0
    let previousWidth = 0
    let previousHeight = 0
    let previousPixelRatio = 0

    const update = () => {
      const element = targetRef.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const pixelRatio = window.devicePixelRatio || 1

      if (
        width === previousWidth &&
        height === previousHeight &&
        pixelRatio === previousPixelRatio
      ) {
        return
      }

      previousWidth = width
      previousHeight = height
      previousPixelRatio = pixelRatio
      setMap(createLiquidGlassMap(width, height, pixelRatio))
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    const element = targetRef.current

    if (element) observer.observe(element)
    window.addEventListener('resize', scheduleUpdate)
    scheduleUpdate()

    return () => {
      cancelAnimationFrame(animationFrame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [targetRef])

  return map
}

export function LiquidGlassFilter({ map }: { map: LiquidGlassMap | null }) {
  if (!map) return null

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter
          id={LIQUID_GLASS_FILTER_ID}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation="0.45"
            result="blurred"
          />
          <feImage
            href={map.displacementUrl}
            x="0"
            y="0"
            width={map.width}
            height={map.height}
            preserveAspectRatio="none"
            result="displacementMap"
          />
          <feDisplacementMap
            in="blurred"
            in2="displacementMap"
            scale={map.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feColorMatrix
            in="displaced"
            type="saturate"
            values="1.3"
            result="saturated"
          />
          <feComposite in="saturated" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
```

## File 2: `liquid-glass-navbar.module.css`

The filter ID in `.refractive` must exactly match `LIQUID_GLASS_FILTER_ID` in the React file.

```css
.navbarShell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 100;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 24px 16px;
}

.navbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100%, 960px);
  padding: 8px 20px;
  border-radius: 9999px;
}

.liquidGlass {
  isolation: isolate;
  overflow: hidden;
  background: rgb(40 40 43 / 0.5);
  box-shadow: 0 12px 36px rgb(0 0 0 / 0.2);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
}

.refractive {
  backdrop-filter: url('#liquid-glass-navbar-refraction');
  -webkit-backdrop-filter: url('#liquid-glass-navbar-refraction');
}

.liquidGlass::after {
  position: absolute;
  inset: 0.5px;
  border-radius: inherit;
  padding: 0.5px;
  background: linear-gradient(
    to bottom,
    rgb(255 255 255 / 0.25) 0%,
    rgb(255 255 255 / 0.14) 7%,
    rgb(255 255 255 / 0.045) 18%,
    transparent 34%,
    transparent 66%,
    rgb(255 255 255 / 0.045) 82%,
    rgb(255 255 255 / 0.14) 93%,
    rgb(255 255 255 / 0.25) 100%
  );
  content: '';
  pointer-events: none;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

@media (prefers-reduced-transparency: reduce) {
  .liquidGlass,
  .refractive {
    background: rgb(31 29 34 / 0.94);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

## File 3: navbar integration

Attach the ref to the same rounded element that owns the glass classes. Render the SVG filter once, near the navbar. The content below is placeholder structure only; replace it with the target project's existing content.

```tsx
'use client'

import * as React from 'react'
import {
  LiquidGlassFilter,
  useLiquidGlassFilter,
} from './liquid-glass-filter'
import styles from './liquid-glass-navbar.module.css'

export function Navbar() {
  const glassRef = React.useRef<HTMLElement>(null)
  const liquidGlassMap = useLiquidGlassFilter(glassRef)

  return (
    <header className={styles.navbarShell}>
      <LiquidGlassFilter map={liquidGlassMap} />

      <nav
        ref={glassRef}
        aria-label="Primary navigation"
        className={`${styles.navbar} ${styles.liquidGlass} ${
          liquidGlassMap ? styles.refractive : ''
        }`}
      >
        <a href="/">Brand</a>

        <div>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>
    </header>
  )
}
```

If the target component already uses an animation library, the ref and glass classes should stay on the animated outer navbar element. Transforms and opacity animations can coexist with this effect.

## Required implementation details

The receiving agent should preserve these details unless the user explicitly asks to tune them:

- Put `overflow: hidden` and `border-radius` on the glass element itself.
- Keep the surface translucent; an opaque background prevents the backdrop from being visible.
- Keep the CSS specular pseudo-element separate from the SVG filter.
- Keep the specular pseudo-element non-interactive with `pointer-events: none`.
- Generate the displacement texture after measuring the rendered navbar.
- Regenerate it through `ResizeObserver` and when device pixel ratio may change.
- Keep the canvas raster scale device-aware and capped to avoid unnecessary memory use.
- Apply `.refractive` only when a map exists. Until then, the CSS fallback remains active.
- Keep the filter ID synchronized between TypeScript and CSS.
- Do not add a conventional white outline, inset rim shadow, or broad interior white gradient.

## Current tuning values

| Control | Current value | Where to change it |
| --- | ---: | --- |
| Glass tint | `#28282B` at 50% | `.liquidGlass` background |
| Fallback blur | `14px` | `.liquidGlass` backdrop filter |
| Fallback saturation | `160%` | `.liquidGlass` backdrop filter |
| Shadow | `0 12px 36px` at 20% black | `.liquidGlass` box shadow |
| Refraction bezel depth | 90% of pill radius | `bezelWidth = radius * 0.9` |
| Optical profile exponent | `1.4` | `opticalBezelRatio` |
| Glass-thickness input | `32` CSS px | `calculateDisplacementProfile(...)` call |
| Maximum filter displacement | `30` CSS px | `scale: Math.min(30, ...)` |
| Displacement multiplier | `0.72` | map `scale` calculation |
| Canvas density cap | `2×` | `rasterScale` calculation |
| SVG pre-blur | `0.45` | `feGaussianBlur` |
| SVG saturation | `1.3` | `feColorMatrix` |
| Specular thickness | `0.5px` | pseudo-element `padding` |
| Specular peak opacity | 25% white | first and last gradient stops |
| Specular orientation | top/bottom peaks | `linear-gradient(to bottom, ...)` |
| Unlit edge | transparent | middle gradient stops |

## Shape limitation

The displacement math models a capsule/pill whose radius is half its rendered height. It works for standard rounded-full navbars. A rounded rectangle with a smaller corner radius requires different signed-distance/normal math; do not merely change the CSS radius and expect physically aligned refraction.

## Multiple navbar instances

The supplied version uses one static SVG filter ID and assumes one navbar instance. If the target renders multiple independent glass surfaces in the same document, parameterize the filter ID per instance and apply the matching `backdrop-filter` URL through an inline style or generated class. Do not duplicate the same SVG ID.

## Troubleshooting

### Refraction is invisible

- Confirm the test browser is Chromium-based.
- Confirm `.refractive` is present after mount.
- Confirm the CSS filter ID and SVG filter ID are identical.
- Test over detailed imagery or text; refraction is hard to see over a flat background.
- Confirm no opaque ancestor or navbar fill blocks the backdrop.

### The edge looks pixelated

- Do not put the specular highlight into the generated canvas.
- Keep the CSS pseudo-element for the highlight.
- Confirm `window.devicePixelRatio` reaches `createLiquidGlassMap`.
- Keep `preserveAspectRatio="none"` on `feImage` so the high-resolution map fits the measured CSS size.

### The effect is too narrow near the edge

- Keep `bezelWidth = radius * 0.9` for the broad current bend.
- Lowering that ratio confines refraction closer to the perimeter.
- The `Math.pow(bezelRatio, 1.4)` profile also controls how the bend is distributed through the bezel.

### The filter breaks under a strict Content Security Policy

The displacement image is a canvas-generated `data:` URL. A strict policy may need to permit `data:` images, or the implementation must be adapted to use a CSP-compatible blob/resource strategy.

### Performance is poor

- Keep the device-pixel-ratio cap at 2× unless a larger map is demonstrably needed.
- Do not regenerate on scroll; regenerate only on size/DPR changes.
- Avoid applying this effect to many elements simultaneously.

## Acceptance checklist

- [ ] The target navbar's original links, branding, responsive behavior, and accessibility remain intact.
- [ ] The glass tint is `#28282B` at 50% opacity.
- [ ] Chromium visibly bends detailed content behind the navbar.
- [ ] Unsupported browsers show a clean blur/saturation fallback.
- [ ] The refraction extends through most of the pill-edge radius instead of only a few pixels near the edge.
- [ ] The specular edge is smooth on a high-DPI display.
- [ ] The specular edge is 0.5 CSS pixels thick and no brighter than 25% white.
- [ ] The top and bottom edges are highlighted symmetrically; the middle of the side edges is unlit.
- [ ] There is no conventional continuous outline or broad white interior streak.
- [ ] Resizing the navbar regenerates the displacement map without errors.
- [ ] Reduced-transparency mode remains readable and usable.
- [ ] The target project's lint, typecheck, and production build pass.

## Ready-to-paste prompt for another AI agent

```text
Implement the liquid-glass background described in the attached “Liquid Glass Navbar Background — Portable AI Handoff” on this project's navbar.

First inspect the existing navbar and the framework/version-specific local documentation. Preserve the navbar's current content, layout, routing, accessibility, responsive behavior, and animations; this handoff supplies only its visual background treatment. Adapt file paths and styling conventions to the target repository instead of assuming Next.js, CSS Modules, or the placeholder markup verbatim.

Use the high-DPI SVG displacement map as a Chromium enhancement, retain the CSS blur/saturation fallback elsewhere, and keep the CSS specular edge outside the rasterized filter so it remains smooth. Preserve the handoff's current visual defaults unless they conflict with an explicit project requirement. Validate the result with the repository's lint, typecheck, build, and—if available—a real browser over detailed page content.
```

## Source-project note

This handoff captures the glass implementation as tuned on September 1, 2026. It intentionally omits the source navbar's brand assets, fonts, links, QR behavior, responsive menu, and scroll-driven entrance/exit animation.
