import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'

import './scss/style.scss'
import './scss/examples.scss'

import { AuthProvider, useAuth } from './context/AuthContext'


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
//Login
const Login = React.lazy(() => import('./views/pages/login/Login'))
// Users
const Register = React.lazy(() => import('./views/pages/Users/Register'))
const UsersEdit = React.lazy(() => import('./views/pages/Users/UsersEdit'))
const UsersDelete = React.lazy(() => import('./views/pages/Users/UsersDelete'))
//Cultivos
const CultivoCreate = React.lazy(() => import('./views/pages/Cultivo/CultivoCreate'))
const CultivoEdit = React.lazy(() => import('./views/pages/Cultivo/CultivoEdit'))
const CultivoDelete = React.lazy(() => import('./views/pages/Cultivo/CultivoDelete'))
//Lectura
const LecturaCreate = React.lazy(() => import('./views/pages/Lectura/LecturaRegister'))
const LecturaEdit = React.lazy(() => import('./views/pages/Lectura/LecturaEdit'))
const LecturaDelete = React.lazy(() => import('./views/pages/Lectura/LecturaDelete'))
// Pages 404 y 500
// Estas páginas se pueden usar para manejar errores o rutas no encontradas
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

// App content wrapped with Auth logic
const AppContent = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const { user } = useAuth() // 👈 Aquí accedemos al usuario autenticado

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) setColorMode(theme)

    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route path="/login" name="Login Page" element={<Login />} />
          <Route path="/register" name="Register Page" element={<Register />} />
          <Route path="/usersedit" name="Edit Users" element={<UsersEdit />} />
          <Route path="/usersdelete" name="Delete User" element={<UsersDelete />} />
          <Route path="/404" name="Page 404" element={<Page404 />} />
          <Route path="/500" name="Page 500" element={<Page500 />} />
          <Route path="/cultivocreate" name="Create Cultivo" element={<CultivoCreate />} />
          <Route path="/cultivoedit" name="Edit Cultivo" element={<CultivoEdit />} />
          <Route path="/cultivodelete" name="Delete Cultivo" element={<CultivoDelete />} />
          <Route path="/lecturaregister" name="Create Lectura" element={<LecturaCreate />} />
          <Route path="/lecturaedit" name="Edit Lectura" element={<LecturaEdit />} />
          <Route path="/lecturadelete" name="Delete Lectura" element={<LecturaDelete />} />
          {/* Redirección condicional: si hay usuario, renderiza el layout. Si no, ve a login */}
          <Route path="*" name="Home" element={user ? <DefaultLayout /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
