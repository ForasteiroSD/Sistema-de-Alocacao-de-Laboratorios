/* Packages */
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

/* Components */
import SideMenu from "./components/SideMenu";
import Header from './components/Header';

/* Pages */
import MainPage from './pages/MainPage'
import Labs from './pages/Labs'
import Reserves from './pages/Reserves'
import Configs from './pages/Configs'

/* Css */
import './App.css'

function App() {
    const logged = true;

    return (
        <>
            <Router>
                <section className="flex">
                    {logged ? <SideMenu /> : null}

                    <div className="">
                        {logged ? <Header /> : null}
                        <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/laboratorios" element={<Labs />} />
                            <Route path="/reservas" element={<Reserves />} />
                            <Route path="/configs" element={<Configs />} />
                        </Routes>
                    </div>
                </section>
            </Router>
        </>
    )
}

export default App
