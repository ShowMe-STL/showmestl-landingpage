import type { CSSProperties, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cabinetGroteskBold, clashGroteskRegular, clashGroteskSemibold } from '../fonts/config'
import styles from './legal-document-layout.module.css'

export type LegalDocumentSection = {
  id: string
  title: string
  content: ReactNode
}

type LegalDocumentProps = {
  kind: 'privacy' | 'terms'
  title: string
  intro: string
  updated: string
  sections: readonly LegalDocumentSection[]
}

const documents = [
  { kind: 'privacy', href: '/privacy-policy', label: 'Privacy Policy' },
  { kind: 'terms', href: '/terms-of-service', label: 'Terms of Service' },
] as const

function ContentsLinks({ sections }: { sections: readonly LegalDocumentSection[] }) {
  return (
    <ol className={styles.contentsList}>
      {sections.map((section, index) => (
        <li key={section.id}>
          <a href={`#${section.id}`} className={styles.contentsLink}>
            <span className={styles.contentsNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span>{section.title}</span>
          </a>
        </li>
      ))}
    </ol>
  )
}

export function LegalDocumentLayout({ kind, title, intro, updated, sections }: LegalDocumentProps) {
  const typeStyles = { '--legal-emphasis-font': clashGroteskSemibold.style.fontFamily } as CSSProperties

  return (
    <div className={`${clashGroteskRegular.className} ${styles.page}`} style={typeStyles}>
      <div className={styles.mesh} aria-hidden="true" />
      <a className={styles.skipLink} href="#legal-content">Skip to policy</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={`${clashGroteskSemibold.className} ${styles.brand}`} aria-label="ShowMe STL home">
            <span className={styles.brandLogoSlot}>
              <Image src="/showme-mobile-logo.svg" alt="" width={15} height={44} className={styles.brandMark} />
            </span>
            <span>ShowMe STL</span>
          </Link>
          <nav className={`${clashGroteskSemibold.className} ${styles.documentNav}`} aria-label="Legal policies">
            {documents.map((document) => (
              <Link
                key={document.kind}
                href={document.href}
                aria-current={kind === document.kind ? 'page' : undefined}
                className={`${styles.documentLink} ${kind === document.kind ? styles.documentLinkActive : ''}`}
              >
                {document.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p className={`${clashGroteskSemibold.className} ${styles.eyebrow}`}>
            <span className={styles.accentDot} aria-hidden="true" />
            ShowMe STL · Legal
          </p>
          <h1 className={`${cabinetGroteskBold.className} ${styles.title}`}>{title}</h1>
          <p className={styles.intro}>{intro}</p>
          <p className={styles.updated}><span className={styles.updatedDot} aria-hidden="true" />Last updated {updated}</p>
        </div>

        <div className={styles.documentGrid}>
          <aside className={styles.sidebar}>
            <nav aria-label={`${title} contents`} className={styles.contents}>
              <p className={`${clashGroteskSemibold.className} ${styles.contentsTitle}`}>On this page</p>
              <ContentsLinks sections={sections} />
              <div className={styles.sidebarSupport}>
                <p className={clashGroteskSemibold.className}>Have a question?</p>
                <a href="mailto:support@showmestl.app">support@showmestl.app <span aria-hidden="true">↗</span></a>
              </div>
            </nav>
            <details className={styles.mobileContents}>
              <summary className={clashGroteskSemibold.className}>On this page <span className={styles.contentsExpand} aria-hidden="true">+</span></summary>
              <nav aria-label={`${title} contents`}><ContentsLinks sections={sections} /></nav>
            </details>
          </aside>

          <article id="legal-content" tabIndex={-1} className={styles.article} aria-label={title}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-heading`}>
                <div className={styles.sectionHeading}>
                  <span className={`${clashGroteskSemibold.className} ${styles.sectionNumber}`} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <h2 id={`${section.id}-heading`} className={cabinetGroteskBold.className}>{section.title}</h2>
                </div>
                <div className={styles.sectionContent}>{section.content}</div>
              </section>
            ))}
          </article>
        </div>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} ShowMe Cities LLC</p>
          <nav aria-label="More information" className={styles.footerLinks}>
            {documents.map((document) => (
              <Link key={document.kind} href={document.href} aria-current={kind === document.kind ? 'page' : undefined}>{document.label}</Link>
            ))}
            <Link href="/sms-verification">Verification texts</Link>
            <a href="mailto:support@showmestl.app">Contact</a>
          </nav>
        </footer>
      </main>
    </div>
  )
}
