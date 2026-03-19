import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './contexts/UserContext'
import { LandingPage } from './pages/LandingPage'
import { BoardPage } from './pages/BoardPage'
import { AddPropertyPage } from './pages/AddPropertyPage'
import { PropertyPage } from './pages/PropertyPage'
import { EditPropertyPage } from './pages/EditPropertyPage'

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/b/:boardId" element={<BoardPage />} />
          <Route path="/b/:boardId/adicionar" element={<AddPropertyPage />} />
          <Route path="/b/:boardId/editar/:propertyId" element={<EditPropertyPage />} />
          <Route path="/b/:boardId/imovel/:propertyId" element={<PropertyPage />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  )
}
