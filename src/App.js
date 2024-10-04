import './App.css'
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AggieMatch from './AggieMatch'
import Auth from './Auth'
import Account from './Account'
import { supabase } from './supabaseClient'
import Login from './signin'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Router>
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/aggie-match" element={<AggieMatch></AggieMatch>} /> 
      </Routes>
      </div>
    </Router>
  )
}

export default App
