/* Packages */
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Components */
import SideMenu from "./components/SideMenu";
import Header from './components/Header';

/* Pages */
import MainPage from './pages/MainPage'
import Labs from './pages/Labs'
import Reserves from './pages/Reserves'
import Configs from './pages/Configs'
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
/* Css */
import './App.css'

function App() {
    const [logged, setLogged] = useState(false);

    return (
        <>
            <Router>
                <section >
                    {!logged ? null : <SideMenu />}
                    
                    <div className="">
                        {!logged ? null : <Header />} 
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            {logged && (
                                <>
                                    <Route path="/" element={<MainPage />} />
                                    <Route path="/laboratorios" element={<Labs />} />
                                    <Route path="/reservas" element={<Reserves />} />
                                    <Route path="/configs" element={<Configs />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                </>
                            )}
                        </Routes>
                    </div>
                </section>
            </Router>
        </>
    )
}

export default App;
