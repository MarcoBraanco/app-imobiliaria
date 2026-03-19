import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import { UserSelector } from './components/collaboration/UserSelector'
import { LandingPage } from './pages/LandingPage'
import { BoardPage } from './pages/BoardPage'
import { AddPropertyPage } from './pages/AddPropertyPage'
import { PropertyPage } from './pages/PropertyPage'
import { EditPropertyPage } from './pages/EditPropertyPage'

function AppRoutes() {
  const { hasUser } = useUser()

  if (!hasUser) {
    return <UserSelector onDone={() => {}} />
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/b/:boardId" element={<BoardPage />} />
      <Route path="/b/:boardId/adicionar" element={<AddPropertyPage />} />
      <Route path="/b/:boardId/editar/:propertyId" element={<EditPropertyPage />} />
      <Route path="/b/:boardId/imovel/:propertyId" element={<PropertyPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  )
}
