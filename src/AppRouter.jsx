import AdminPage from './AdminPage.jsx'
import WeddingInvitationPage from './WeddingInvitationPage.jsx'

function AppRouter() {
  return window.location.pathname.replace(/\/$/, '') === '/admin'
    ? <AdminPage />
    : <WeddingInvitationPage />
}

export default AppRouter