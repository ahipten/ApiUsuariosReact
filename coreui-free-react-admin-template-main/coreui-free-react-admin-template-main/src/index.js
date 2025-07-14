import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'
import { AuthProvider } from './context/AuthContext' // ✅ importa tu contexto

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AuthProvider> {/* ✅ envolvemos App aquí */}
      <App />
    </AuthProvider>
  </Provider>,
)
