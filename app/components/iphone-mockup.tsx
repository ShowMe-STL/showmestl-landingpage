import Image from 'next/image'
import type { ReactNode } from 'react'

interface IPhoneMockupProps {
  src?: string
  alt?: string
  className?: string
  children?: ReactNode
}

export default function IPhoneMockup({
  src,
  alt = '',
  className = '',
  children,
}: IPhoneMockupProps) {
  return (
    <div
      className={`relative aspect-[1470/3000] ${className}`}
      style={{ height: 'min(calc(100vh - 48px), 858px)' }}
    >
      <div
        className="absolute overflow-hidden rounded-[12%/6%]"
        style={{ top: '2.1%', bottom: '2.1%', left: '5%', right: '5%' }}
      >
        {children ??
          (src ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes="420px"
              className="object-cover object-top"
              priority
            />
          ) : null)}
      </div>
      <Image
        src="/mockups/iphone-16-pro-max.png"
        alt=""
        fill
        sizes="420px"
        className="pointer-events-none select-none object-contain"
        priority
      />
    </div>
  )
}
