import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { V1Wizard, V2Wizard } from './components/wizard/CalculatorWizard'
import { LoadsStep } from './components/wizard/LoadsStep'
import { SpecStep } from './components/wizard/SpecStep'
import { SystemStep } from './components/wizard/SystemStep'
import './index.css'
import { LandingPage } from './pages/LandingPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />

            <Route path="v1" element={<V1Wizard />}>
              <Route index element={<Navigate to="system" replace />} />
              <Route path="system" element={<SystemStep />} />
              <Route path="loads" element={<LoadsStep />} />
              <Route path="spec" element={<SpecStep />} />
            </Route>

            <Route path="v2" element={<V2Wizard />}>
              <Route index element={<Navigate to="system" replace />} />
              <Route path="system" element={<SystemStep />} />
              <Route path="loads" element={<LoadsStep />} />
              <Route path="spec" element={<SpecStep />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
