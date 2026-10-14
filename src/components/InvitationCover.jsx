import { useEffect, useState } from 'react'
import { formatWeddingDate } from '../weddingData.js'

export function WelcomeEnvelope({ onOpen, wedding }) {
  const [isOpening, setIsOpening] = useState(false)

  useEffect(() => {
    if (!isOpening) return undefined
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(onOpen, reducedMotion ? 0 : 900)
    return () => window.clearTimeout(timer)
  }, [isOpening, onOpen])

  return (
    <section className={`welcome-screen${isOpening ? ' is-opening' : ''}`} role="dialog" aria-modal="true" aria-label="Wedding invitation envelope">
      <div className="welcome-heading">
        <p className="welcome-monogram">{wedding.groom[0]} <span>&</span> {wedding.bride[0]}</p>
        <p className="welcome-kicker">A little something special</p>
      </div>
      <div className="envelope-scene">
        <div className="envelope-art" aria-hidden="true">
          <div className="envelope-letter">
            <span className="letter-kicker">Together with our families</span>
            <span className="letter-names">{wedding.bride} <i>&</i> {wedding.groom}</span>
            <span className="letter-date">{wedding.dateShort}</span>
          </div>
          <div className="envelope-back" />
          <div className="envelope-fold-left" />
          <div className="envelope-fold-right" />
          <div className="envelope-pocket" />
          <div className="envelope-flap" />
          <div className="envelope-seal" />
        </div>
        <button className="envelope-open-button" type="button" onClick={() => setIsOpening(true)} disabled={isOpening}>
          <span className="seal-button" aria-hidden="true">{wedding.groom[0]} <i>&</i> {wedding.bride[0]}</span>
          <span className="open-invitation-label">{isOpening ? 'Opening your invitation' : 'Open your invitation'}</span>
        </button>
      </div>
      <p className="welcome-date">{formatWeddingDate(wedding.date)} <span>·</span> {wedding.location}</p>
    </section>
  )
}

export function HeroSection({ wedding }) {
  return (
    <section id="home" className="hero-image relative flex min-h-[720px] min-h-[100svh] flex-col justify-between px-6 pb-10 pt-6 text-white sm:px-10 sm:pb-12 lg:px-16" style={{ backgroundImage: `url("${wedding.heroImage}")` }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,27,23,0.42)_0%,rgba(16,27,23,0.12)_40%,rgba(16,27,23,0.67)_100%)]" />
      <header className="relative z-10 flex items-center justify-between border-b border-white/35 pb-5">
        <a className="font-serif text-xl tracking-[0.04em] text-white" href="#home" aria-label={`${wedding.bride} and ${wedding.groom}, home`}>{wedding.groom[0]} <span className="px-1 font-sans text-xs">&</span> {wedding.bride[0]}</a>
        <nav className="hidden items-center gap-7 text-[10px] uppercase tracking-[0.16em] lg:flex" aria-label="Main navigation">
          <a className="text-white transition-opacity hover:opacity-65" href="#details">The day</a>
          <a className="text-white transition-opacity hover:opacity-65" href="#venues">Venues</a>
          <a className="text-white transition-opacity hover:opacity-65" href="#entourage">Entourage</a>
          <a className="text-white transition-opacity hover:opacity-65" href="#gallery">Photos</a>
          <a className="text-white transition-opacity hover:opacity-65" href="#rsvp">RSVP</a>
        </nav>
        <a className="border border-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-[var(--ink)]" href="#rsvp">Kindly reply</a>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-[1200px] pb-5 text-center">
        <p className="mb-5 text-[10px] uppercase tracking-[0.25em] sm:text-xs sm:tracking-[0.3em]">{wedding.openingLine}</p>
        <h1 className="font-serif text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.025em]">{wedding.bride} <span className="font-serif italic">&</span> {wedding.groom}</h1>
        <p className="mx-auto mt-5 max-w-lg text-xs leading-6 text-white/90 sm:text-sm">{wedding.invitationMessage}</p>
        <div className="mx-auto mt-7 flex max-w-[440px] items-center justify-center gap-4 text-[9px] uppercase tracking-[0.17em] sm:mt-9 sm:text-xs sm:tracking-[0.23em]">
          <span className="h-px w-7 bg-white/75 sm:w-9" /><p>{formatWeddingDate(wedding.date)}</p><span className="h-px w-7 bg-white/75 sm:w-9" />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/85 sm:text-xs">{wedding.location}</p>
      </div>
      <a href="#details" className="relative z-10 mx-auto flex items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/85">Join us for the celebration <span aria-hidden="true" className="text-base">↓</span></a>
    </section>
  )
}