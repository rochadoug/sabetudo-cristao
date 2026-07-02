import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import '../styles/app.css'

export default function AppLayout() {
  return (
    <div className="app-root">
      <Header/>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

