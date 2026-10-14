import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatWeddingDate } from '../weddingData.js'

export function PhotoGallerySection({ wedding }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const couplePhotos = wedding.photos

  if (couplePhotos.length === 0) {
    return (
      <section id="gallery" className="bg-[#eee9dd] px-6 py-20 text-center sm:px-10 sm:py-28">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A few favorite frames</p>
        <h2 className="font-serif text-5xl sm:text-6xl">Our photo album</h2>
      </section>
    )
  }

  function changePhoto(direction) {
    setActivePhoto((current) => (current + direction + couplePhotos.length) % couplePhotos.length)
  }

  return (
    <section id="gallery" className="bg-[#eee9dd] px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[1040px]">
        <div className="mb-9 text-center"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A few favorite frames</p><h2 className="font-serif text-5xl sm:text-6xl">Our photo album</h2><p className="mt-3 text-xs text-[var(--muted)]">Sample portraits for now; replace these with your own engagement photos.</p></div>
        <div className="relative overflow-hidden bg-[var(--olive)]" aria-roledescription="carousel" aria-label="Couple photo gallery">
          <div className="relative aspect-[4/3] sm:aspect-[16/9]">
            <img key={couplePhotos[activePhoto].src} className="h-full w-full object-cover" src={couplePhotos[activePhoto].src} alt={couplePhotos[activePhoto].alt} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
            <button className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-[var(--ink)] transition-colors hover:bg-white sm:left-6 sm:size-12" type="button" onClick={() => changePhoto(-1)} aria-label="Previous photo" title="Previous photo">‹</button>
            <button className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-xl text-[var(--ink)] transition-colors hover:bg-white sm:right-6 sm:size-12" type="button" onClick={() => changePhoto(1)} aria-label="Next photo" title="Next photo">›</button>
            <p className="absolute bottom-5 left-5 font-serif text-2xl text-white sm:bottom-8 sm:left-9 sm:text-4xl" aria-live="polite">{couplePhotos[activePhoto].caption}</p>
            <p className="absolute bottom-6 right-5 text-[9px] tracking-[0.16em] text-white sm:bottom-9 sm:right-9">{String(activePhoto + 1).padStart(2, '0')} <span className="px-1">/</span> {String(couplePhotos.length).padStart(2, '0')}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-center gap-2" aria-label="Choose a photo">
          {couplePhotos.map((photo, index) => <button key={photo.src} type="button" className={`h-2.5 rounded-full transition-all ${activePhoto === index ? 'w-8 bg-[var(--olive)]' : 'w-2.5 bg-[var(--moss)]/40 hover:bg-[var(--moss)]'}`} onClick={() => setActivePhoto(index)} aria-label={`Show photo ${index + 1}: ${photo.caption}`} aria-current={activePhoto === index ? 'true' : undefined} />)}
        </div>
      </div>
    </section>
  )
}

export function LoveStorySection({ wedding }) {
  return <section id="story" className="bg-[var(--olive)] px-6 py-20 text-center text-[var(--paper)] sm:px-10 sm:py-24"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/65">A little about us</p><h2 className="font-serif text-5xl sm:text-6xl">Our story</h2><p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-white/80">{wedding.story}</p><p className="mt-7 font-serif text-2xl italic">{wedding.storyClosing}</p></section>
}

export function GiftGuideSection({ wedding }) {
  return <section id="gifts" className="paper-texture px-6 py-16 text-center sm:px-10 sm:py-20"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A note on gifts</p><h2 className="font-serif text-4xl sm:text-5xl">{wedding.giftTitle}</h2><p className="mx-auto mt-5 max-w-[560px] text-sm leading-7 text-[var(--muted)]">{wedding.giftMessage}</p></section>
}

export function GuestRemindersSection({ wedding }) {
  return (
    <section id="reminders" className="bg-[#eee9dd] px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto max-w-[900px]"><div className="mb-8 text-center"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A few thoughtful notes</p><h2 className="font-serif text-5xl sm:text-6xl">Guest reminders</h2></div>
        <ul className="grid gap-4 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
          {wedding.reminders.map((reminder) => <li className="border-t border-[var(--moss)]/25 pt-4" key={reminder.title}><strong className="font-medium text-[var(--ink)]">{reminder.title}</strong> {reminder.text}</li>)}
        </ul>
      </div>
    </section>
  )
}

export function RsvpSection({ wedding }) {
  const rsvpUrl = `${window.location.origin}${window.location.pathname}#rsvp`

  function handleRsvp(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = [`Name: ${form.get('guestName')}`, `Number of guests: ${form.get('guestCount')}`, `Dietary notes: ${form.get('dietaryNotes') || 'None'}`].join('\n')
    const subject = encodeURIComponent(`Wedding RSVP for ${wedding.groom} and ${wedding.bride}`)
    window.location.href = `mailto:${wedding.contactEmail}?subject=${subject}&body=${encodeURIComponent(body)}`
  }

  return (
    <section id="rsvp" className="paper-texture px-6 py-20 text-center sm:py-28">
      <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">We saved you a seat</p><h2 className="font-serif text-5xl sm:text-7xl">Will you celebrate with us?</h2>
      <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">Kindly confirm your attendance on or before <strong className="font-medium text-[var(--ink)]">{formatWeddingDate(wedding.replyBy, { weekday: undefined })}</strong>.</p>
      <form className="mx-auto mt-8 grid max-w-[540px] gap-4 text-left sm:grid-cols-2" onSubmit={handleRsvp}>
        <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] sm:col-span-2">Your name<input className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" type="text" name="guestName" autoComplete="name" placeholder="Name as it appears on your invitation" required /></label>
        <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Guests attending<select className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" name="guestCount" defaultValue="1"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label>
        <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Dietary notes<input className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" type="text" name="dietaryNotes" placeholder="Optional" /></label>
        <div className="text-center sm:col-span-2"><button className="mt-2 inline-flex items-center justify-center border border-[var(--olive)] bg-[var(--olive)] px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-transparent hover:text-[var(--olive)]" type="submit">Send your RSVP <span className="ml-3" aria-hidden="true">→</span></button></div>
      </form>
      <p className="mt-4 text-xs text-[var(--muted)]">Your email app will open with your RSVP ready to send to {wedding.contactEmail}.</p>
      <div className="mt-8 inline-flex flex-col items-center gap-3"><div className="border border-[var(--moss)]/20 bg-white p-2"><QRCodeSVG value={rsvpUrl} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div><p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Scan to open this invitation</p></div>
    </section>
  )
}

export function ClosingSection({ wedding }) {
  return <footer className="bg-[var(--olive)] px-6 py-10 text-center text-[var(--paper)]"><p className="font-serif text-2xl">{wedding.groom[0]} <span className="px-1 font-sans text-xs">&</span> {wedding.bride[0]}</p><p className="mx-auto mt-4 max-w-lg font-serif text-xl italic">{wedding.closingMessage}</p><p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-white/65">{formatWeddingDate(wedding.date)} <span className="px-2">·</span> {wedding.location}</p></footer>
}