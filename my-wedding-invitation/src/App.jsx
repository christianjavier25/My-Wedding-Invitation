import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const bride = 'Clara Santos'
const groom = 'Oliver Reyes'
const weddingDate = 'Saturday, December 12, 2026'
const replyBy = 'November 15, 2026'
const contactEmail = 'claraandoliver@example.com'
const ceremonyMap = 'https://maps.google.com/?q=San+Agustin+Church+Manila'
const receptionMap = 'https://maps.google.com/?q=The+Manila+Hotel'
const weddingTimestamp = new Date('2026-12-12T14:00:00+08:00').getTime()

function getCountdown() {
  const remaining = Math.max(0, weddingTimestamp - Date.now())
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}

function App() {
  const [countdown, setCountdown] = useState(getCountdown)
  const rsvpUrl = `${window.location.origin}${window.location.pathname}#rsvp`

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function handleRsvp(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = [
      `Name: ${form.get('guestName')}`,
      `Number of guests: ${form.get('guestCount')}`,
      `Dietary notes: ${form.get('dietaryNotes') || 'None'}`,
    ].join('\n')
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent('Wedding RSVP for Clara and Oliver')}&body=${encodeURIComponent(body)}`
  }

  return (
    <main className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <section id="home" className="hero-image relative flex min-h-[720px] min-h-[100svh] flex-col justify-between px-6 pb-10 pt-6 text-white sm:px-10 sm:pb-12 lg:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,27,23,0.42)_0%,rgba(16,27,23,0.12)_40%,rgba(16,27,23,0.67)_100%)]" />
        <header className="relative z-10 flex items-center justify-between border-b border-white/35 pb-5">
          <a className="font-serif text-xl tracking-[0.04em] text-white" href="#home" aria-label={`${bride} and ${groom}, home`}>
            C <span className="px-1 font-sans text-xs">&</span> O
          </a>
          <nav className="hidden items-center gap-7 text-[10px] uppercase tracking-[0.16em] lg:flex" aria-label="Main navigation">
            <a className="text-white transition-opacity hover:opacity-65" href="#details">The day</a>
            <a className="text-white transition-opacity hover:opacity-65" href="#venues">Venues</a>
            <a className="text-white transition-opacity hover:opacity-65" href="#entourage">Entourage</a>
            <a className="text-white transition-opacity hover:opacity-65" href="#rsvp">RSVP</a>
          </nav>
          <a className="border border-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-[var(--ink)]" href="#rsvp">Kindly reply</a>
        </header>

        <div className="relative z-10 mx-auto w-full max-w-[1200px] pb-5 text-center">
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] sm:text-xs sm:tracking-[0.3em]">Together with our families,</p>
          <h1 className="font-serif text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-[-0.025em]">
            Clara <span className="font-serif italic">&</span> Oliver
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-xs leading-6 text-white/90 sm:text-sm">invite you to celebrate their wedding and the beginning of their next chapter together.</p>
          <div className="mx-auto mt-7 flex max-w-[440px] items-center justify-center gap-4 text-[9px] uppercase tracking-[0.17em] sm:mt-9 sm:text-xs sm:tracking-[0.23em]">
            <span className="h-px w-7 bg-white/75 sm:w-9" />
            <p>{weddingDate}</p>
            <span className="h-px w-7 bg-white/75 sm:w-9" />
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/85 sm:text-xs">Manila, Philippines</p>
        </div>

        <a href="#details" className="relative z-10 mx-auto flex items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/85">
          Join us for the celebration <span aria-hidden="true" className="text-base">↓</span>
        </a>
      </section>

      <section id="details" className="paper-texture px-6 py-20 text-center sm:px-10 sm:py-28">
        <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">Save the date</p>
        <h2 className="mx-auto max-w-[740px] font-serif text-4xl leading-[1.1] sm:text-6xl">A celebration of <span className="italic text-[var(--moss)]">love & family</span></h2>
        <p className="mx-auto mt-5 max-w-[470px] text-sm leading-7 text-[var(--muted)]">Please join us as we exchange vows and celebrate with the people who mean the most to us.</p>
        <div className="mx-auto mt-10 grid max-w-[620px] grid-cols-2 border-y border-[var(--moss)]/30 py-6 sm:py-8">
          <div className="border-r border-[var(--moss)]/30 px-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">The bride</p>
            <p className="mt-2 font-serif text-xl sm:text-2xl">{bride}</p>
          </div>
          <div className="px-3">
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">The groom</p>
            <p className="mt-2 font-serif text-xl sm:text-2xl">{groom}</p>
          </div>
        </div>
        <p className="mt-8 font-serif text-2xl sm:text-3xl">Saturday <span className="px-2 italic text-[var(--moss)]">·</span> December 12, 2026</p>
        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Ceremony begins at 2:00 PM</p>

        <div className="mx-auto mt-12 max-w-[620px] border border-[var(--moss)]/25 px-5 py-6 sm:px-10">
          <p className="mb-5 text-[9px] uppercase tracking-[0.22em] text-[var(--muted)]">Counting down to forever</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4" aria-live="off">
            {Object.entries(countdown).map(([unit, value]) => (
              <div key={unit}>
                <p className="font-serif text-3xl tabular-nums sm:text-4xl">{String(value).padStart(2, '0')}</p>
                <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[var(--muted)]">{unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="venues" className="bg-[var(--olive)] px-6 py-20 text-[var(--paper)] sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/65">Where to join us</p>
            <h2 className="font-serif text-5xl sm:text-7xl">Two places, one celebration</h2>
          </div>
          <div className="grid gap-px bg-white/20 md:grid-cols-2">
            <article className="bg-[var(--olive)] px-6 py-9 text-center sm:px-10 sm:py-12">
              <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-white/60">Saturday <span className="px-2">/</span> 2:00 PM</p>
              <h3 className="font-serif text-3xl sm:text-4xl">Wedding ceremony</h3>
              <p className="mt-5 text-base">San Agustin Church</p>
              <address className="mt-2 text-sm not-italic leading-6 text-white/75">General Luna Street, Intramuros<br />Manila, 1002 Metro Manila, Philippines</address>
              <a className="mt-5 inline-block border-b border-white/60 pb-1 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-65" href={ceremonyMap} target="_blank" rel="noreferrer">Directions to the church <span aria-hidden="true">↗</span></a>
            </article>
            <article className="bg-[var(--olive)] px-6 py-9 text-center sm:px-10 sm:py-12">
              <p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-white/60">Saturday <span className="px-2">/</span> 5:00 PM</p>
              <h3 className="font-serif text-3xl sm:text-4xl">Reception</h3>
              <p className="mt-5 text-base">The Manila Hotel</p>
              <address className="mt-2 text-sm not-italic leading-6 text-white/75">One Rizal Park, Manila<br />0913 Metro Manila, Philippines</address>
              <a className="mt-5 inline-block border-b border-white/60 pb-1 text-[10px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-65" href={receptionMap} target="_blank" rel="noreferrer">Directions to the reception <span aria-hidden="true">↗</span></a>
              <p className="mt-4 text-xs text-white/60">Allow approximately 15 minutes of travel between venues.</p>
            </article>
          </div>
          <div className="mt-10 grid gap-8 text-center sm:grid-cols-2">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-2"><QRCodeSVG value={ceremonyMap} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Scan for ceremony directions</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-2"><QRCodeSVG value={receptionMap} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/75">Scan for reception directions</p>
            </div>
          </div>
        </div>
      </section>

      <section id="timeline" className="paper-texture px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[760px]">
          <div className="mb-9 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">The day at a glance</p>
            <h2 className="font-serif text-5xl sm:text-6xl">Our wedding timeline</h2>
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr><th className="w-[35%] px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Time</th><th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em]">Celebration</th></tr></thead>
            <tbody>
              <tr><td className="px-4 py-3">2:00 PM</td><td className="px-4 py-3">Wedding ceremony</td></tr>
              <tr><td className="px-4 py-3">4:00 PM</td><td className="px-4 py-3">Cocktail hour</td></tr>
              <tr><td className="px-4 py-3">5:00 PM</td><td className="px-4 py-3">Reception & dinner</td></tr>
              <tr><td className="px-4 py-3">6:00 PM</td><td className="px-4 py-3">Toasts, program & dancing</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="dress-code" className="bg-[#eee9dd] px-6 py-20 text-center sm:px-10 sm:py-24">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">What to wear</p>
        <h2 className="font-serif text-5xl sm:text-6xl">Filipiniana formal</h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[var(--muted)]">We invite our guests to wear formal attire or Filipiniana-inspired looks. Celebrate with us in our garden palette.</p>
        <div className="mt-7 flex items-center justify-center gap-4" aria-label="Guest color palette: sage, terracotta, warm ivory, and muted rose">
          <span className="h-9 w-9 rounded-full bg-[#87917a] ring-1 ring-black/10" />
          <span className="h-9 w-9 rounded-full bg-[#b9795f] ring-1 ring-black/10" />
          <span className="h-9 w-9 rounded-full bg-[#e8dfcf] ring-1 ring-black/10" />
          <span className="h-9 w-9 rounded-full bg-[#b68b86] ring-1 ring-black/10" />
        </div>
        <p className="mt-4 text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Sage <span className="px-2">·</span> Terracotta <span className="px-2">·</span> Ivory <span className="px-2">·</span> Rose</p>
        <p className="mt-3 text-xs text-[var(--muted)]">Kindly reserve white and ivory for the bride.</p>
      </section>

      <section id="entourage" className="paper-texture px-6 py-20 text-center sm:px-10 sm:py-28">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">Our favorite people</p>
        <h2 className="font-serif text-5xl sm:text-6xl">The wedding party</h2>
        <p className="mt-4 text-sm text-[var(--muted)]">With grateful hearts, we are honored to have you by our side.</p>
        <div className="mx-auto mt-10 grid max-w-[900px] gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div><h3 className="font-serif text-2xl">Principal Sponsors</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Ninong: [Sponsor name]<br />Ninang: [Sponsor name]</p></div>
          <div><h3 className="font-serif text-2xl">Honor Attendants</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Best Man: [Name]<br />Maid of Honor: [Name]</p></div>
          <div><h3 className="font-serif text-2xl">Bridal Party</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Bridesmaids & Groomsmen<br />[Add names here]</p></div>
          <div><h3 className="font-serif text-2xl">Bearers</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Ring Bearer: [Name]<br />Coin Bearer: [Name]<br />Bible Bearer: [Name]</p></div>
          <div><h3 className="font-serif text-2xl">Flower Girls</h3><p className="mt-3 text-sm leading-6 text-[var(--muted)]">[Add names here]</p></div>
        </div>
      </section>

      <section id="story" className="bg-[var(--olive)] px-6 py-20 text-center text-[var(--paper)] sm:px-10 sm:py-24">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/65">A little about us</p>
        <h2 className="font-serif text-5xl sm:text-6xl">Our story</h2>
        <p className="mx-auto mt-6 max-w-[560px] text-sm leading-7 text-white/80">We met through mutual friends, and one conversation turned into many shared adventures, long dinners, and a love that felt like home. Today, we are grateful to begin our next chapter together.</p>
        <p className="mt-7 font-serif text-2xl italic">The best is still ahead.</p>
      </section>

      <section id="gifts" className="paper-texture px-6 py-16 text-center sm:px-10 sm:py-20">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A note on gifts</p>
        <h2 className="font-serif text-4xl sm:text-5xl">Your presence is our present.</h2>
        <p className="mx-auto mt-5 max-w-[560px] text-sm leading-7 text-[var(--muted)]">Your presence is the greatest gift of all. Should you wish to bless us with a gift, a monetary contribution toward our future together would be greatly appreciated.</p>
      </section>

      <section id="reminders" className="bg-[#eee9dd] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-8 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">A few thoughtful notes</p>
            <h2 className="font-serif text-5xl sm:text-6xl">Guest reminders</h2>
          </div>
          <ul className="grid gap-4 text-sm leading-6 text-[var(--muted)] sm:grid-cols-2">
            <li className="border-t border-[var(--moss)]/25 pt-4"><strong className="font-medium text-[var(--ink)]">Unplugged ceremony.</strong> Please silence and put away phones during the ceremony; our photographers will capture the moment.</li>
            <li className="border-t border-[var(--moss)]/25 pt-4"><strong className="font-medium text-[var(--ink)]">Adults-only celebration.</strong> We love your little ones, but this gathering is reserved for adult guests.</li>
            <li className="border-t border-[var(--moss)]/25 pt-4"><strong className="font-medium text-[var(--ink)]">Getting there.</strong> Please allow extra time for Manila traffic. Parking is available at both venues, subject to availability.</li>
            <li className="border-t border-[var(--moss)]/25 pt-4"><strong className="font-medium text-[var(--ink)]">Please RSVP.</strong> Let us know about dietary requirements when you reply by {replyBy}.</li>
          </ul>
        </div>
      </section>

      <section id="rsvp" className="paper-texture px-6 py-20 text-center sm:py-28">
        <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-[var(--moss)]">We saved you a seat</p>
        <h2 className="font-serif text-5xl sm:text-7xl">Will you celebrate with us?</h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">Kindly confirm your attendance on or before <strong className="font-medium text-[var(--ink)]">{replyBy}</strong>.</p>
        <form className="mx-auto mt-8 grid max-w-[540px] gap-4 text-left sm:grid-cols-2" onSubmit={handleRsvp}>
          <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] sm:col-span-2">Your name
            <input className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" type="text" name="guestName" autoComplete="name" placeholder="Name as it appears on your invitation" required />
          </label>
          <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Guests attending
            <select className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" name="guestCount" defaultValue="1">
              <option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option>
            </select>
          </label>
          <label className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Dietary notes
            <input className="mt-2 w-full border border-[var(--moss)]/35 bg-white/60 px-4 py-3 text-sm normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" type="text" name="dietaryNotes" placeholder="Optional" />
          </label>
          <div className="text-center sm:col-span-2">
            <button className="mt-2 inline-flex items-center justify-center border border-[var(--olive)] bg-[var(--olive)] px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-transparent hover:text-[var(--olive)]" type="submit">Send your RSVP <span className="ml-3" aria-hidden="true">→</span></button>
          </div>
        </form>
        <p className="mt-4 text-xs text-[var(--muted)]">Your email app will open with your RSVP ready to send to {contactEmail}.</p>
        <div className="mt-8 inline-flex flex-col items-center gap-3">
          <div className="border border-[var(--moss)]/20 bg-white p-2"><QRCodeSVG value={rsvpUrl} size={112} bgColor="#ffffff" fgColor="#28352b" level="M" /></div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">Scan to open this invitation</p>
        </div>
      </section>

      <footer className="bg-[var(--olive)] px-6 py-10 text-center text-[var(--paper)]">
        <p className="font-serif text-2xl">C <span className="px-1 font-sans text-xs">&</span> O</p>
        <p className="mx-auto mt-4 max-w-lg font-serif text-xl italic">We look forward to celebrating this special day with you. Thank you for being part of our love story.</p>
        <p className="mt-5 text-[9px] uppercase tracking-[0.2em] text-white/65">December 12, 2026 <span className="px-2">·</span> Manila, Philippines</p>
      </footer>
    </main>
  )
}

export default App