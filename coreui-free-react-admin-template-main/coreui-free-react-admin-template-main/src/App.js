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
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/Users/Register'))
const UsersEdit = React.lazy(() => import('./views/pages/Users/UsersEdit'))
const UsersDelete = React.lazy(() => import('./views/pages/Users/UsersDelete'))
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
