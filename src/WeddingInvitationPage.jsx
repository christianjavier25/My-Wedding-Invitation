import { useEffect, useState } from 'react'
import { defaultInvitation } from './weddingData.js'
import { WelcomeEnvelope, HeroSection } from './components/InvitationCover.jsx'
import { WeddingDetailsSection, VenuesSection, TimelineSection, DressCodeSection, EntourageSection } from './components/EventSections.jsx'
import { PhotoGallerySection, LoveStorySection, GiftGuideSection, GuestRemindersSection, RsvpSection, ClosingSection } from './components/GuestSections.jsx'

function WeddingInvitationPage() {
  const [showInvitation, setShowInvitation] = useState(false)
  const invitation = defaultInvitation

  useEffect(() => {
    document.body.style.overflow = showInvitation ? '' : 'hidden'
    const scrollTimer = showInvitation ? window.setTimeout(() => {
      const details = document.getElementById('details')
      if (!details) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: details.getBoundingClientRect().top + window.scrollY, behavior: reducedMotion ? 'auto' : 'smooth' })
    }, 100) : undefined

    return () => {
      if (scrollTimer) window.clearTimeout(scrollTimer)
      document.body.style.overflow = ''
    }
  }, [showInvitation])

  return (
    <>
      {!showInvitation && <WelcomeEnvelope wedding={invitation} onOpen={() => setShowInvitation(true)} />}
      <main aria-hidden={!showInvitation} className="overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
        <HeroSection wedding={invitation} />
        <WeddingDetailsSection wedding={invitation} />
        <VenuesSection wedding={invitation} />
        <TimelineSection wedding={invitation} />
        <DressCodeSection wedding={invitation} />
        <EntourageSection wedding={invitation} />
        <PhotoGallerySection wedding={invitation} />
        <LoveStorySection wedding={invitation} />
        <GiftGuideSection wedding={invitation} />
        <GuestRemindersSection wedding={invitation} />
        <RsvpSection wedding={invitation} />
        <ClosingSection wedding={invitation} />
      </main>
    </>
  )
}

export default WeddingInvitationPage