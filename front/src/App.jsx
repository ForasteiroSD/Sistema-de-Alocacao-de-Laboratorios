/* Packages */
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

/* Components */
import NavBar from "./components/NavBar";

/* Pages */
import MainPage from './pages/MainPage'

/* Css */
import './App.css'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
