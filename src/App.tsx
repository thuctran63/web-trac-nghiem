import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Sections } from './pages/Sections'
import { Quiz } from './pages/Quiz'
import { Results } from './pages/Results'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sections" element={<Sections />} />
        <Route path="/quiz/:slug" element={<Quiz />} />
        <Route path="/results/:slug" element={<Results />} />
      </Routes>
    </Layout>
  )
}
