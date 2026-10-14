export const defaultInvitation = {
  bride: 'Ericka',
  groom: 'Christian',
  date: '2028-03-25',
  ceremonyTime: '14:00',
  replyBy: '2028-02-25',
  contactEmail: 'christianandericka@example.com',
  location: 'Manila, Philippines',
  openingLine: 'Together with our families,',
  invitationMessage: 'invite you to celebrate their wedding and the beginning of their next chapter together.',
  heroImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=2400&q=90',
  ceremonyVenue: 'San Agustin Church',
  ceremonyAddress: 'General Luna Street, Intramuros\nManila, 1002 Metro Manila, Philippines',
  ceremonyMap: 'https://maps.google.com/?q=San+Agustin+Church+Manila',
  receptionVenue: 'The Manila Hotel',
  receptionAddress: 'One Rizal Park, Manila\n0913 Metro Manila, Philippines',
  receptionMap: 'https://maps.google.com/?q=The+Manila+Hotel',
  receptionTime: '17:00',
  travelMinutes: 15,
  timeline: [
    { time: '14:00', activity: 'Wedding ceremony' },
    { time: '16:00', activity: 'Cocktail hour' },
    { time: '17:00', activity: 'Reception & dinner' },
    { time: '18:00', activity: 'Toasts, program & dancing' },
  ],
  dressCodeTitle: 'Filipiniana formal',
  dressCodeDescription: 'We invite our guests to wear formal attire or Filipiniana-inspired looks. Celebrate with us in our garden palette.',
  palette: [
    { name: 'Sage', color: '#87917a' },
    { name: 'Terracotta', color: '#b9795f' },
    { name: 'Ivory', color: '#e8dfcf' },
    { name: 'Rose', color: '#b68b86' },
  ],
  attireNote: 'Kindly reserve white and ivory for the bride.',
  entourage: {
    principalSponsors: 'Ninong: [Sponsor name]\nNinang: [Sponsor name]',
    honorAttendants: 'Best Man: [Name]\nMaid of Honor: [Name]',
    bridalParty: 'Bridesmaids & Groomsmen\n[Add names here]',
    bearers: 'Ring Bearer: [Name]\nCoin Bearer: [Name]\nBible Bearer: [Name]',
    flowerGirls: '[Add names here]',
  },
  story: 'We met through mutual friends, and one conversation turned into many shared adventures, long dinners, and a love that felt like home. Today, we are grateful to begin our next chapter together.',
  storyClosing: 'The best is still ahead.',
  giftTitle: 'Your presence is our present.',
  giftMessage: 'Your presence is the greatest gift of all. Should you wish to bless us with a gift, a monetary contribution toward our future together would be greatly appreciated.',
  reminders: [
    { title: 'Unplugged ceremony.', text: 'Please silence and put away phones during the ceremony; our photographers will capture the moment.' },
    { title: 'Adults-only celebration.', text: 'We love your little ones, but this gathering is reserved for adult guests.' },
    { title: 'Getting there.', text: 'Please allow extra time for Manila traffic. Parking is available at both venues, subject to availability.' },
    { title: 'Please RSVP.', text: 'Let us know about dietary requirements when you reply by the RSVP deadline.' },
  ],
  closingMessage: 'We look forward to celebrating this special day with you. Thank you for being part of our love story.',
  photos: [
    { src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1800&q=85', alt: 'Sample wedding couple portrait, replace with your engagement photo', caption: 'A day to call ours' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=85', alt: 'Sample pre-wedding portrait, replace with your own photo', caption: 'Every little moment' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1800&q=85', alt: 'Sample wedding celebration photo, replace with your own photo', caption: 'And all the days to come' },
  ],
}

export const wedding = defaultInvitation
export const couplePhotos = defaultInvitation.photos

export function formatWeddingDate(date, options = {}) {
  if (!date) return ''
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(parsed)
}

export function formatWeddingTime(time) {
  if (!time) return ''
  const [hour, minute] = time.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`
}

export function getCountdown(invitation = defaultInvitation) {
  const remaining = Math.max(0, new Date(`${invitation.date}T${invitation.ceremonyTime}:00+08:00`).getTime() - Date.now())
  return {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60),
  }
}