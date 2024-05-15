/* Packages */
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

/* Components */
import SideMenu from "./components/SideMenu";

/* Pages */
import MainPage from './pages/MainPage'

/* Css */
import './App.css'

function App() {
  const logged = true;

  return (
    <>
      <Router>
        <section className="flex">
          {logged ? <SideMenu /> : null}

          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/laboratorios" element={<MainPage />} />
            <Route path="/reservas" element={<MainPage />} />
          </Routes>
        </section>
      </Router>
    </>
  )
}

export default App
