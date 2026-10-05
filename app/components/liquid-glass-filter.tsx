'use client'

import * as React from 'react'

export const LIQUID_GLASS_FILTER_ID = 'showme-topbar-refraction'

type LiquidGlassMap = {
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
  targetRef: React.RefObject<HTMLDivElement | null>,
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
      className="pointer-events-none absolute h-0 w-0"
      focusable="false"
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
