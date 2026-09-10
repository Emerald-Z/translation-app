import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { type Session } from '@supabase/supabase-js'

import AppShell from './components/AppShell'
import { supabase } from './lib/supabase'
import ProfileProvider from './components/ProfileProvider'

import AccountSetup from './pages/auth/AccountSetup'
import Intro from './pages/auth/Intro'
import LoginPage from './pages/auth/Login'
import SignupPage from './pages/auth/Signup'

import AddBook from './pages/AddBook'
import Home from './pages/Home'
import Library from './pages/Library'
import ReadPicker from './pages/ReadPicker'
import ReaderPage from './pages/ReaderPage'

import AllCards from './pages/cards/AllCards'
import ByBook from './pages/cards/ByBook'
import ByLanguage from './pages/cards/ByLanguage'
import CardsLayout from './pages/cards/CardsLayout'
import CollectionDetail from './pages/cards/CollectionDetail'
import Collections from './pages/cards/Collections'
import Directory from './pages/cards/Directory'

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  if (session === null) {
    return (
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  return (
    <ProfileProvider>
      <Routes>
        <Route path="/account" element={<AccountSetup />} />
        <Route path="/read/:bookId" element={<ReaderPage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/add" element={<AddBook />} />
          <Route path="/read" element={<ReadPicker />} />

          <Route path="/cards" element={<CardsLayout />}>
            <Route index element={<Directory />} />
            <Route path="all" element={<AllCards />} />
            <Route path="language" element={<ByLanguage />} />
            <Route path="language/:code" element={<ByLanguage />} />
            <Route path="book" element={<ByBook />} />
            <Route path="book/:bookId" element={<ByBook />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:collectionId" element={<CollectionDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProfileProvider>
  )
}
