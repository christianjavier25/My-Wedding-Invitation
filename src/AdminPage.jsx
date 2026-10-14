import { useEffect, useState } from 'react'
import { defaultInvitation } from './weddingData.js'

async function readResponse(response) {
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.')
  return result
}

async function loadSettings(signal) {
  const response = await fetch('/api/admin/invitation', { signal })
  const result = await readResponse(response)
  return result.invitation
}

function TextField({ label, value, onChange, type = 'text', ...inputProps }) {
  return (
    <label className="grid gap-2 text-xs font-medium text-[var(--ink)]">
      {label}
      <input className="min-h-11 w-full border border-[#d7d5cc] bg-white px-3 text-sm font-normal text-[var(--ink)] outline-none focus:border-[var(--olive)]" type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} {...inputProps} />
    </label>
  )
}

function TextAreaField({ label, value, onChange, rows = 3 }) {
  return (
    <label className="grid gap-2 text-xs font-medium text-[var(--ink)]">
      {label}
      <textarea className="w-full resize-y border border-[#d7d5cc] bg-white px-3 py-2 text-sm font-normal leading-6 text-[var(--ink)] outline-none focus:border-[var(--olive)]" rows={rows} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function SectionHeading({ eyebrow, children }) {
  return (
    <div className="mb-5 border-b border-[#e1dfd6] pb-3">
      <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--moss)]">{eyebrow}</p>
      <h2 className="mt-1 font-serif text-2xl text-[var(--ink)]">{children}</h2>
    </div>
  )
}

const buttonClass = 'inline-flex min-h-10 items-center justify-center border border-[var(--olive)] px-4 text-xs font-medium text-[var(--olive)] transition-colors hover:bg-[var(--olive)] hover:text-white disabled:cursor-wait disabled:opacity-55'

function AdminPage() {
  const [configured, setConfigured] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [passcodeConfirm, setPasscodeConfirm] = useState('')
  const [invitation, setInvitation] = useState(defaultInvitation)
  const [savedInvitation, setSavedInvitation] = useState(defaultInvitation)
  const [message, setMessage] = useState('Checking editor access…')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function checkAccess() {
      try {
        const response = await fetch('/api/admin/session', { signal: controller.signal })
        const session = await readResponse(response)
        setConfigured(session.configured)
        setAuthenticated(session.authenticated)
        if (session.authenticated) {
          const settings = await loadSettings(controller.signal)
          setInvitation(settings)
          setSavedInvitation(settings)
          setMessage('Your invitation settings are ready to edit.')
        } else {
          setMessage('')
        }
      } catch (error) {
        if (error.name !== 'AbortError') setMessage(error.message || 'The admin API is not available. Start the app with npm run dev.')
      }
    }

    checkAccess()
    return () => controller.abort()
  }, [])

  function updateField(field, value) {
    setInvitation((current) => ({ ...current, [field]: value }))
  }

  function updateItem(collection, index, field, value) {
    setInvitation((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    if (!configured && passcode !== passcodeConfirm) {
      setMessage('The passcodes do not match.')
      return
    }

    setBusy('login')
    setMessage('')
    try {
      const setupResponse = configured ? null : await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      if (setupResponse) {
        await readResponse(setupResponse)
        setConfigured(true)
      }
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })
      await readResponse(response)
      const settings = await loadSettings()
      setInvitation(settings)
      setSavedInvitation(settings)
      setAuthenticated(true)
      setPasscode('')
      setPasscodeConfirm('')
      setMessage('Editor unlocked.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function handleLogout() {
    setBusy('logout')
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setAuthenticated(false)
      setMessage('The editor is locked.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function handleSave(event) {
    event.preventDefault()
    setBusy('save')
    setMessage('')
    try {
      const response = await fetch('/api/admin/invitation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitation }),
      })
      const result = await readResponse(response)
      const previousFiles = new Set([savedInvitation.heroImage, ...savedInvitation.photos.map((photo) => photo.src)])
      const currentFiles = new Set([result.invitation.heroImage, ...result.invitation.photos.map((photo) => photo.src)])
      const removedFiles = [...previousFiles].filter((src) => src.startsWith('/PhotoGallery/') && !currentFiles.has(src))
      setInvitation(result.invitation)
      setSavedInvitation(result.invitation)
      await Promise.all(removedFiles.map((src) => fetch(`/api/admin/images/${encodeURIComponent(src.split('/').pop())}`, { method: 'DELETE' }).catch(() => null)))
      setMessage('Invitation changes saved.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  async function handleImageUpload(event, kind) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 12 * 1024 * 1024) {
      setMessage('Choose an image smaller than 12 MB.')
      return
    }

    setBusy(`upload-${kind}`)
    setMessage('')
    try {
      const body = new FormData()
      body.append('image', file)
      const response = await fetch(`/api/admin/upload?kind=${kind}`, { method: 'POST', body })
      const result = await readResponse(response)
      if (kind === 'hero') {
        updateField('heroImage', result.image.src)
      } else {
        const filename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
        setInvitation((current) => ({
          ...current,
          photos: [...current.photos, { ...result.image, alt: `${current.bride} and ${current.groom} wedding photo`, caption: filename || 'Wedding photo' }],
        }))
      }
      setMessage('Image uploaded. Save changes to publish it.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy('')
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-5 py-12 text-[var(--ink)]">
        <div className="mx-auto max-w-md">
          <a className="text-xs text-[var(--moss)]" href="/">← Return to invitation</a>
          <div className="mt-8 border-y border-[#ddd9cc] py-8">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--moss)]">Christian & Ericka</p>
            <h1 className="mt-2 font-serif text-4xl">Invitation editor</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{configured ? 'Enter your private passcode to update the invitation.' : 'Create a private passcode to protect invitation updates.'}</p>
            <form className="mt-7 grid gap-4" onSubmit={handleLogin}>
              <label className="grid gap-2 text-xs font-medium">Passcode
                <input className="min-h-12 border border-[#d7d5cc] bg-white px-3 text-base outline-none focus:border-[var(--olive)]" type="password" autoComplete={configured ? 'current-password' : 'new-password'} minLength={8} value={passcode} onChange={(event) => setPasscode(event.target.value)} required disabled={busy === 'login'} />
              </label>
              {!configured && <label className="grid gap-2 text-xs font-medium">Confirm passcode
                <input className="min-h-12 border border-[#d7d5cc] bg-white px-3 text-base outline-none focus:border-[var(--olive)]" type="password" autoComplete="new-password" minLength={8} value={passcodeConfirm} onChange={(event) => setPasscodeConfirm(event.target.value)} required disabled={busy === 'login'} />
              </label>}
              <button className={`${buttonClass} bg-[var(--olive)] text-white hover:bg-transparent hover:text-[var(--olive)]`} type="submit" disabled={busy === 'login'}>{busy === 'login' ? 'Unlocking…' : configured ? 'Unlock editor' : 'Create passcode & unlock'}</button>
            </form>
            {message && <p className="mt-4 text-sm text-[var(--muted)]" role="status">{message}</p>}
          </div>
        </div>
      </main>
    )
  }

  const isDirty = JSON.stringify(invitation) !== JSON.stringify(savedInvitation)

  return (
    <main className="min-h-screen bg-[#f1efe8] text-[var(--ink)]">
      <header className="border-b border-[#dedbd1] bg-[var(--paper)] px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div><p className="text-[9px] uppercase tracking-[0.2em] text-[var(--moss)]">Christian & Ericka</p><h1 className="font-serif text-2xl">Invitation editor</h1></div>
          <div className="flex items-center gap-3"><a className="text-xs text-[var(--moss)] hover:text-[var(--ink)]" href="/" target="_blank" rel="noreferrer">View invitation ↗</a><button className={buttonClass} type="button" onClick={handleLogout} disabled={busy === 'logout'}>Lock editor</button></div>
        </div>
      </header>

      <form className="mx-auto max-w-6xl px-5 py-8 sm:px-8" onSubmit={handleSave}>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-[#dedbd1] pb-5">
          <div><p className="text-sm text-[var(--muted)]">Update invitation content and photos.</p>{message && <p className="mt-1 text-xs text-[var(--moss)]" role="status">{message}</p>}</div>
          <button className={`${buttonClass} bg-[var(--olive)] text-white hover:bg-transparent hover:text-[var(--olive)]`} type="submit" disabled={!isDirty || busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save all changes'}</button>
        </div>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="01 / The couple">Names & date</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Bride" value={invitation.bride} onChange={(value) => updateField('bride', value)} required />
            <TextField label="Groom" value={invitation.groom} onChange={(value) => updateField('groom', value)} required />
            <TextField label="Wedding date" type="date" value={invitation.date} onChange={(value) => updateField('date', value)} required />
            <TextField label="Ceremony time" type="time" value={invitation.ceremonyTime} onChange={(value) => updateField('ceremonyTime', value)} required />
            <TextField label="RSVP deadline" type="date" value={invitation.replyBy} onChange={(value) => updateField('replyBy', value)} required />
            <TextField label="RSVP email" type="email" value={invitation.contactEmail} onChange={(value) => updateField('contactEmail', value)} required />
            <TextField label="City / location" value={invitation.location} onChange={(value) => updateField('location', value)} />
          </div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="02 / First impression">Cover & hero</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="Welcome line" value={invitation.openingLine} onChange={(value) => updateField('openingLine', value)} />
            <TextAreaField label="Invitation message" value={invitation.invitationMessage} onChange={(value) => updateField('invitationMessage', value)} />
            <div className="grid gap-4 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="grid content-start gap-4"><TextField label="Hero image URL" value={invitation.heroImage} onChange={(value) => updateField('heroImage', value)} /><label className="grid gap-2 text-xs font-medium">Upload a new hero image<input className="block w-full text-xs text-[var(--muted)] file:mr-3 file:min-h-10 file:border file:border-[var(--olive)] file:bg-transparent file:px-3 file:text-xs file:text-[var(--olive)]" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageUpload(event, 'hero')} disabled={busy === 'upload-hero'} /><span className="font-normal text-[var(--muted)]">JPEG, PNG, or WebP; maximum 12 MB.</span></label></div>
              {invitation.heroImage && <img className="aspect-[16/9] w-full object-cover" src={invitation.heroImage} alt="Hero image preview" />}
            </div>
          </div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="03 / Where to celebrate">Ceremony & reception</SectionHeading>
          <div className="grid gap-x-8 gap-y-7 lg:grid-cols-2">
            <div className="grid content-start gap-4"><h3 className="font-serif text-xl">Ceremony</h3><TextField label="Venue name" value={invitation.ceremonyVenue} onChange={(value) => updateField('ceremonyVenue', value)} /><TextAreaField label="Full address" value={invitation.ceremonyAddress} onChange={(value) => updateField('ceremonyAddress', value)} /><TextField label="Map URL" value={invitation.ceremonyMap} onChange={(value) => updateField('ceremonyMap', value)} /></div>
            <div className="grid content-start gap-4"><h3 className="font-serif text-xl">Reception</h3><TextField label="Venue name" value={invitation.receptionVenue} onChange={(value) => updateField('receptionVenue', value)} /><TextAreaField label="Full address" value={invitation.receptionAddress} onChange={(value) => updateField('receptionAddress', value)} /><TextField label="Reception time" type="time" value={invitation.receptionTime} onChange={(value) => updateField('receptionTime', value)} /><TextField label="Map URL" value={invitation.receptionMap} onChange={(value) => updateField('receptionMap', value)} /><TextField label="Travel time between venues (minutes)" type="number" min="0" value={invitation.travelMinutes} onChange={(value) => updateField('travelMinutes', Number(value))} /></div>
          </div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="04 / The schedule">Wedding timeline</SectionHeading>
          <div className="grid gap-3">
            {invitation.timeline.map((item, index) => <div className="grid gap-3 sm:grid-cols-[150px_minmax(0,1fr)_auto]" key={`timeline-${index}`}><TextField label={`Time ${index + 1}`} type="time" value={item.time} onChange={(value) => updateItem('timeline', index, 'time', value)} /><TextField label="Event" value={item.activity} onChange={(value) => updateItem('timeline', index, 'activity', value)} /><button className={buttonClass} type="button" onClick={() => updateField('timeline', invitation.timeline.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}
            <button className={`${buttonClass} justify-self-start`} type="button" onClick={() => updateField('timeline', [...invitation.timeline, { time: '19:00', activity: 'New event' }])}>Add timeline item</button>
          </div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="05 / Guest attire">Dress code & colors</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2"><TextField label="Dress code title" value={invitation.dressCodeTitle} onChange={(value) => updateField('dressCodeTitle', value)} /><TextAreaField label="Dress code details" value={invitation.dressCodeDescription} onChange={(value) => updateField('dressCodeDescription', value)} /><TextField label="Attire note" value={invitation.attireNote} onChange={(value) => updateField('attireNote', value)} /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{invitation.palette.map((item, index) => <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2" key={`palette-${index}`}><TextField label={`Color ${index + 1}`} value={item.name} onChange={(value) => updateItem('palette', index, 'name', value)} /><label className="grid gap-2 text-xs font-medium">Swatch<input className="h-11 w-12 cursor-pointer border border-[#d7d5cc] bg-white p-1" type="color" value={item.color} onChange={(event) => updateItem('palette', index, 'color', event.target.value)} /></label></div>)}</div>
          <button className={`${buttonClass} mt-4`} type="button" onClick={() => updateField('palette', [...invitation.palette, { name: 'New color', color: '#70816b' }])}>Add palette color</button>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="06 / Your people">Entourage</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">{Object.entries(invitation.entourage).map(([key, value]) => <TextAreaField key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())} value={value} onChange={(updatedValue) => updateField('entourage', { ...invitation.entourage, [key]: updatedValue })} />)}</div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="07 / Your story">Story & gifts</SectionHeading>
          <div className="grid gap-4 lg:grid-cols-2"><TextAreaField label="Couple story" value={invitation.story} onChange={(value) => updateField('story', value)} rows={4} /><TextField label="Story closing line" value={invitation.storyClosing} onChange={(value) => updateField('storyClosing', value)} /><TextField label="Gift section heading" value={invitation.giftTitle} onChange={(value) => updateField('giftTitle', value)} /><TextAreaField label="Gift message" value={invitation.giftMessage} onChange={(value) => updateField('giftMessage', value)} rows={4} /><TextAreaField label="Closing message" value={invitation.closingMessage} onChange={(value) => updateField('closingMessage', value)} /></div>
        </section>

        <section className="border-b border-[#dedbd1] py-7">
          <SectionHeading eyebrow="08 / Before the day">Guest reminders</SectionHeading>
          <div className="grid gap-4">{invitation.reminders.map((reminder, index) => <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]" key={`reminder-${index}`}><TextField label="Reminder title" value={reminder.title} onChange={(value) => updateItem('reminders', index, 'title', value)} /><TextField label="Reminder details" value={reminder.text} onChange={(value) => updateItem('reminders', index, 'text', value)} /><button className={buttonClass} type="button" onClick={() => updateField('reminders', invitation.reminders.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}<button className={`${buttonClass} justify-self-start`} type="button" onClick={() => updateField('reminders', [...invitation.reminders, { title: 'New reminder', text: '' }])}>Add reminder</button></div>
        </section>

        <section className="py-7">
          <SectionHeading eyebrow="09 / Your photos">Photo gallery</SectionHeading>
          <label className="grid max-w-xl gap-2 text-xs font-medium">Upload gallery photos<input className="block w-full text-xs text-[var(--muted)] file:mr-3 file:min-h-10 file:border file:border-[var(--olive)] file:bg-transparent file:px-3 file:text-xs file:text-[var(--olive)]" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { [...event.target.files].forEach((file) => handleImageUpload({ target: { files: [file], value: '' } }, 'gallery')); event.target.value = '' }} disabled={busy === 'upload-gallery'} /><span className="font-normal text-[var(--muted)]">Uploaded files are stored in public/PhotoGallery. Each image can have its own caption and alt text.</span></label>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{invitation.photos.map((photo, index) => <article className="grid content-start gap-3 border-b border-[#dedbd1] pb-5" key={`${photo.src}-${index}`}><img className="aspect-[4/3] w-full object-cover" src={photo.src} alt={photo.alt || ''} /><TextField label="Caption" value={photo.caption} onChange={(value) => updateItem('photos', index, 'caption', value)} /><TextField label="Alt text" value={photo.alt} onChange={(value) => updateItem('photos', index, 'alt', value)} /><p className="break-all text-[10px] text-[var(--muted)]">{photo.src}</p><button className={`${buttonClass} justify-self-start`} type="button" onClick={() => updateField('photos', invitation.photos.filter((_, itemIndex) => itemIndex !== index))}>Remove photo</button></article>)}</div>
        </section>

        <div className="sticky bottom-0 flex justify-end border-t border-[#dedbd1] bg-[#f1efe8]/95 py-4 backdrop-blur">
          <button className={`${buttonClass} min-h-12 bg-[var(--olive)] px-6 text-white hover:bg-transparent hover:text-[var(--olive)]`} type="submit" disabled={!isDirty || busy === 'save'}>{busy === 'save' ? 'Saving…' : 'Save all changes'}</button>
        </div>
      </form>
    </main>
  )
}

export default AdminPage