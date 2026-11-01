import { type SharePreview } from '@/lib/shared-content-links.mjs'

const markPath = 'M146.873 247.048h20.721c-.229-2.052-.305-3.032-.697-5.782-2.138-14.99-8.841-29.7-23.787-52.204-17.383-26.173-22.498-39.718-22.395-59.296.11-20.621 4.821-31.885 28.021-67 15.181-22.979 29.671-53.221 30.267-53.974.595.753 15.085 31 30.267 53.974 23.199 35.115 27.91 46.379 28.02 67 .104 19.578-5.011 33.123-22.394 59.296-14.947 22.504-21.65 37.214-23.788 52.204-.392 2.75-.468 3.73-.697 5.782h20.72c5.689 0 10.3 4.611 10.3 10.3v2.345c0 5.689-4.611 10.3-10.3 10.3h-64.258c-5.689 0-10.3-4.611-10.3-10.3v-2.345c0-5.689 4.611-10.3 10.3-10.3z'
const markStem = 'M179.003 365.214s-13.646-30.477-44.713-44.491c23.712-15.928 29.619-38.454 29.619-38.454h30.187s5.907 22.526 29.619 38.454c-31.067 14.014-44.712 44.491-44.712 44.491'

function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-[#C00828]" aria-hidden="true">
      <svg viewBox="118 6 122 362" className="h-[18px] w-4">
        <path fill="#fff" d={markPath} />
        <path fill="#fff" d={markStem} />
      </svg>
    </span>
  )
}

function MetaIcon({ kind }: { kind: SharePreview['meta'][number]['kind'] }) {
  if (kind === 'time') {
    return (
      <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" stroke="#C00828" strokeWidth="1.8" />
        <path d="M12 8v5l3 2" fill="none" stroke="#C00828" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'venue') {
    return (
      <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
        <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" fill="none" stroke="#C00828" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === 'tag') {
    return (
      <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
        <path d="M20 13l-7 7-9-9V4h7l9 9z" fill="none" stroke="#C00828" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.2" fill="none" stroke="#C00828" strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" fill="none" stroke="#C00828" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" fill="none" stroke="#C00828" strokeWidth="1.8" />
    </svg>
  )
}

function Hero({ preview }: { preview: SharePreview }) {
  if (preview.imageUrls.length >= 2) {
    return (
      <div className={`absolute inset-0 grid grid-cols-2 ${preview.imageUrls.length > 2 ? 'grid-rows-2' : 'grid-rows-1'}`}>
        {preview.imageUrls.slice(0, 4).map((src) => (
          // Public photos are hosted on arbitrary https origins, so they are not run through the image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt="" className="h-full w-full object-cover" />
        ))}
      </div>
    )
  }
  if (preview.imageUrl) {
    // Public photos are hosted on arbitrary https origins, so they are not run through the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={preview.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
  }
  return <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_0%,rgba(192,8,40,0.55),transparent_55%),radial-gradient(90%_70%_at_0%_100%,rgba(58,135,255,0.35),transparent_50%),#141218]" />
}

export function ShareLanding({ appUrl, preview }: { appUrl: string; preview: SharePreview }) {
  const longCopy = preview.description.length > 180
  return (
    <main className="h-svh overflow-hidden bg-[#090a0c] text-[#171412]">
      <div className="relative mx-auto h-svh w-full max-w-md">
        <header className="absolute inset-x-0 top-0 z-20 flex h-12 items-center px-4 text-white">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Mark />
            Showme STL
          </span>
        </header>
        <div className="absolute inset-x-0 top-12 bottom-[calc(58svh-1.5rem)] overflow-hidden bg-[#141218]">
          <Hero preview={preview} />
        </div>
        <section className="absolute inset-x-0 bottom-0 z-10 h-[58svh] overflow-y-auto rounded-t-[20px] bg-[#f6f1ea] px-5 pb-28 pt-6">
          <div className="flex items-start gap-3.5">
            {preview.dateTile && (
              <div className="w-16 shrink-0 overflow-hidden rounded-2xl bg-white text-center shadow-[0_8px_24px_rgba(22,19,17,0.08)]">
                <div className="bg-[#C00828] py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">{preview.dateTile.month}</div>
                <div className="pt-1.5 text-[26px] font-semibold leading-none text-[#161311]">{preview.dateTile.day}</div>
                <div className="px-1 pb-1.5 pt-1 text-[10px] font-medium text-[#6b625c]">{preview.dateTile.time}</div>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C00828]">{preview.label}</p>
              <h1 className="mt-1 text-[2rem] font-semibold leading-[1.05] tracking-tight text-[#161311]">{preview.title}</h1>
            </div>
          </div>
          {preview.meta.length > 0 && (
            <ul className="mt-4 space-y-2.5">
              {preview.meta.map((item) => (
                <li key={`${item.kind}-${item.text}`} className="flex items-start gap-2.5 text-[15px] leading-snug text-[#3f3935]">
                  <MetaIcon kind={item.kind} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className={longCopy
            ? 'mt-4 max-h-24 overflow-hidden text-[15px] leading-6 text-[#4e4742] [mask-image:linear-gradient(to_bottom,#000_62%,transparent)]'
            : 'mt-4 text-[15px] leading-6 text-[#4e4742]'}>
            {preview.description}
          </p>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
        <div className="w-full max-w-md bg-[#f6f1ea]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(9,10,12,0.16)] backdrop-blur-md">
          <a href={appUrl} className="flex h-14 items-center justify-center rounded-2xl bg-[#C00828] text-[17px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Open in ShowMe</a>
        </div>
      </div>
    </main>
  )
}
