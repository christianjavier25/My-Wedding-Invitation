import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatWeddingDate, formatWeddingTime, getCountdown } from '../weddingData.js'

function DisplayLines({ value }) {
  return value.split('\n').map((line, index) => <span className="block" key={`${index}-${line}`}>{line}</span>)
}

export function WeddingDetailsSection({ wedding }) {
  const { date: weddingDate, ceremonyTime } = wedding
  const [countdown, setCountdown] = useState(() => getCountdown({ date: weddingDate, ceremonyTime }))

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown({ date: weddingDate, ceremonyTime })), 1000)
    return () => window.clearInterval(timer)
  }, [weddingDate, ceremonyTime])

  return (
    <section id="details" className="paper-texture px-6 py-20 text-center sm:px-10 sm:py-28">
      <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">Save the date</p>
      <h2 className="mx-auto max-w-[740px] font-serif text-4xl leading-[1.1] sm:text-6xl">A celebration of <span className="italic text-[var(--moss)]">love & family</span></h2>
      <p className="mx-auto mt-5 max-w-[470px] text-sm leading-7 text-[var(--muted)]">Please join us as we exchange vows and celebrate with the people who mean the most to us.</p>
      <div className="mx-auto mt-10 grid max-w-[620px] grid-cols-2 border-y border-[var(--moss)]/30 py-6 sm:py-8">
        <div className="border-r border-[var(--moss)]/30 px-3"><p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">The bride</p><p className="mt-2 font-serif text-xl sm:text-2xl">{wedding.bride}</p></div>
        <div className="px-3"><p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">The groom</p><p className="mt-2 font-serif text-xl sm:text-2xl">{wedding.groom}</p></div>
      </div>
      <p className="mt-8 font-serif text-2xl sm:text-3xl">{formatWeddingDate(wedding.date)}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Ceremony begins at {formatWeddingTime(wedding.ceremonyTime)}</p>
      <div className="mx-auto mt-12 max-w-[620px] border border-[var(--moss)]/25 px-5 py-6 sm:px-10">
        <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Counting down to forever</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-live="off">
          {Object.entries(countdown).map(([unit, value]) => <div key={unit}><p className="font-serif text-3xl tabular-nums sm:text-4xl">{String(value).padStart(2, '0')}</p><p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[var(--muted)]">{unit}</p></div>)}
        </div>
      </div>
    </section>
  )
}

export function VenuesSection({ wedding }) {
  return (
    <section id="venues" className="bg-[var(--olive)] px-6 py-20 text-[var(--paper)] sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-12 text-center"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/65">Where to join us</p><h2 className="font-serif text-5xl sm:text-7xl">Two places, one celebration</h2></div>
        <div className="grid gap-px bg-white/20 md:grid-cols-2">
          <article className="bg-[var(--olive)] px-6 py-9 text-center sm:px-10 sm:py-12">
            <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-white/60">{formatWeddingDate(wedding.date, { year: undefined, month: 'short', day: 'numeric' })} <span className="px-2">/</span> {formatWeddingTime(wedding.ceremonyTime)}</p><h3 className="font-serif text-3xl sm:text-4xl">Wedding ceremony</h3><p className="mt-5 text-base">{wedding.ceremonyVenue}</p>
            <address className="mt-2 text-sm not-italic leading-6 text-white/75"><DisplayLines value={wedding.ceremonyAddress} /></address>
            <a className="mt-5 inline-block border-b border-white/60 pb-1 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-65" href={wedding.ceremonyMap} target="_blank" rel="noreferrer">Directions to the church <span aria-hidden="true">↗</span></a>
          </article>
          <article className="bg-[var(--olive)] px-6 py-9 text-center sm:px-10 sm:py-12">
            <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-white/60">{formatWeddingDate(wedding.date, { year: undefined, month: 'short', day: 'numeric' })} <span className="px-2">/</span> {formatWeddingTime(wedding.receptionTime)}</p><h3 className="font-serif text-3xl sm:text-4xl">Reception</h3><p className="mt-5 text-base">{wedding.receptionVenue}</p>
            <address className="mt-2 text-sm not-italic leading-6 text-white/75"><DisplayLines value={wedding.receptionAddress} /></address>
            <a className="mt-5 inline-block border-b border-white/60 pb-1 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-65" href={wedding.receptionMap} target="_blank" rel="noreferrer">Directions to the reception <span aria-hidden="true">↗</span></a>
            <p className="mt-4 text-xs text-white/60">Allow approximately {wedding.travelMinutes} minutes of travel between venues.</p>
          </article>
        </div>
        <div className="mt-10 grid gap-8 text-center sm:grid-cols-2">
          <div className="flex flex-col items-center gap-3"><div className="bg-white p-2"><QRCodeSVG value={wedding.ceremonyMap} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div><p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Scan for ceremony directions</p></div>
          <div className="flex flex-col items-center gap-3"><div className="bg-white p-2"><QRCodeSVG value={wedding.receptionMap} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div><p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Scan for reception directions</p></div>
        </div>
      </div>
    </section>
  )
}

export function TimelineSection({ wedding }) {
  return (
    <section id="timeline" className="paper-texture px-6 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-9 text-center"><p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">The day at a glance</p><h2 className="font-serif text-5xl sm:text-6xl">Our wedding timeline</h2></div>
        <table className="w-full border-collapse text-left text-sm">
          <thead><tr><th className="w-[35%] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Time</th><th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Celebration</th></tr></thead>
          <tbody>{wedding.timeline.map((item) => <tr key={`${item.time}-${item.activity}`}><td className="px-4 py-3">{formatWeddingTime(item.time)}</td><td className="px-4 py-3">{item.activity}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

export function DressCodeSection({ wedding }) {
  return (
    <section id="dress-code" className="bg-[#eee9dd] px-6 py-20 text-center sm:px-10 sm:py-24">
      <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">What to wear</p><h2 className="font-serif text-5xl sm:text-6xl">{wedding.dressCodeTitle}</h2>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[var(--muted)]">{wedding.dressCodeDescription}</p>
      <div className="mt-7 flex items-center justify-center gap-4" aria-label={`Guest color palette: ${wedding.palette.map((item) => item.name).join(', ')}`}>{wedding.palette.map((item) => <span key={item.name} className="h-9 w-9 rounded-full ring-1 ring-black/10" style={{ backgroundColor: item.color }} title={item.name} />)}</div>
      <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">{wedding.palette.map((item) => item.name).join(' · ')}</p><p className="mt-3 text-xs text-[var(--muted)]">{wedding.attireNote}</p>
    </section>
  )
}

export function EntourageSection({ wedding }) {
  return (
    <section id="entourage" className="paper-texture px-6 py-20 text-center sm:px-10 sm:py-28">
      <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">Our favorite people</p><h2 className="font-serif text-5xl sm:text-6xl">The wedding party</h2><p className="mt-4 text-sm text-[var(--muted)]">With grateful hearts, we are honored to have you by our side.</p>
      <div className="mx-auto mt-10 grid max-w-[900px] gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div><h3 className="font-serif text-2xl">Principal Sponsors</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><DisplayLines value={wedding.entourage.principalSponsors} /></p></div>
        <div><h3 className="font-serif text-2xl">Honor Attendants</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><DisplayLines value={wedding.entourage.honorAttendants} /></p></div>
        <div><h3 className="font-serif text-2xl">Bridal Party</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><DisplayLines value={wedding.entourage.bridalParty} /></p></div>
        <div><h3 className="font-serif text-2xl">Bearers</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><DisplayLines value={wedding.entourage.bearers} /></p></div>
        <div><h3 className="font-serif text-2xl">Flower Girls</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]"><DisplayLines value={wedding.entourage.flowerGirls} /></p></div>
      </div>
    </section>
  )
}