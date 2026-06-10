import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BookDetailPage from './pages/BookDetailPage'
import BookmarksPage from './pages/BookmarksPage'
import ProgressOverview from './pages/ProgressOverview'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:bookId" element={<BookDetailPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/progress" element={<ProgressOverview />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
