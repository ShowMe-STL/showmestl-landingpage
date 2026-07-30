import Image from 'next/image'
import { Card, Reveal, SectionHeading, Stat } from '../section-ui'

const BRANDS = [
  {
    category: 'Cookies · Brand Spotlight',
    name: 'Crumbl',
    logo: '/partner/crumbl-logo.png',
    body: 'A rotating weekly flavor drop keeps audiences hooked — every Monday, thousands of fans post organic taste-test reviews across social platforms.',
    stats: [
      { value: '$1B+', label: 'In total sales' },
      { value: '9.6M', label: 'TikTok followers' },
    ],
  },
  {
    category: 'Apparel · Brand Spotlight',
    name: 'Gymshark',
    logo: '/partner/gymshark-logo.png',
    body: 'Gymshark seeded product to real people and let community posts drive growth, fostering organic brand advocates instead of buying attention.',
    stats: [
      { value: '$1B+', label: 'Brand valuation' },
      { value: '$0', label: 'Traditional paid ad budget' },
    ],
  },
  {
    category: 'Beverage · Brand Spotlight',
    name: 'Chamberlain Coffee',
    logo: '/partner/chamberlain-logo.png',
    body: "Built on a single creator's audience trust, casual native content converted brand affinity into repeat buyers without an ad machine.",
    stats: [
      { value: '1', label: 'Social feed as the entire funnel' },
      { value: '$0', label: 'Spent on traditional ad machines' },
    ],
  },
]

export function Proof() {
  return (
    <div className="space-y-10">
      <Reveal>
        <SectionHeading title="Businesses that don't reach the next generation become invisible" />
      </Reveal>

      <Reveal delay={0.1}>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src="/partner/case-study.png"
            alt="Friends laughing together at a bar"
            fill
            sizes="(min-width: 768px) 72rem, 100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black" />
          <div className="relative flex h-full items-end p-6 sm:p-10">
            <Stat
              value="73%"
              label="of Gen Z and Millennials visited a restaurant because of a social media review in the past three months."
              accent
            />
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <SectionHeading eyebrow="Case studies" title="Brands that grew by being where people already trust" />
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {BRANDS.map((brand, i) => (
          <Reveal key={brand.name} delay={0.2 + i * 0.1}>
            <Card className="flex h-full flex-col">
              <p className="text-xs font-medium text-white/50">{brand.category}</p>
              <div className="relative mt-3 h-9 w-32">
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  sizes="140px"
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
              <p className="mt-4 text-sm text-white/60">{brand.body}</p>
              <div className="mt-6 flex flex-1 items-end gap-6">
                {brand.stats.map((stat) => (
                  <Stat key={stat.label} value={stat.value} label={stat.label} accent />
                ))}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
