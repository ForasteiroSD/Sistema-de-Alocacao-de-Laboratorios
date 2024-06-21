/* Packages */
import { AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

/* Components */
import SideMenu from "./components/SideMenu";
import Header from './components/Header';
import Alert from './components/Alert';

/* Pages */
import MainPage from './pages/MainPage';
import Labs from './pages/Labs';
import Reserves from './pages/Reserves';
import Configs from './pages/Configs';
import Users from "./pages/Users";
import LoginPage from "./pages/LoginPage";
import MyReserves from './pages/MyReserves';
import InfoLab from './pages/InfoLab'
import NotFound from './pages/NotFound';

/* Context */
import { UserProvider, UserContext } from './context/UserContext';
import { AlertProvider, AlertContext } from './context/AlertContext';

/* Css */
import './App.css';

function App() {
    return (
        <AlertProvider>
            <AlertContext.Consumer>{({ alertState, alertType, alertMessage }) => (
                <>
                    <AnimatePresence>
                        {alertState && <Alert messageType={alertType} message={alertMessage} />}
                    </AnimatePresence>

                    <UserProvider>
                        <Router>
                            <section className="flex">
                                <UserContext.Consumer>
                                    {({ user }) => (
                                        <>
                                            {user && !user.loading && <SideMenu />}
                                            <div>
                                                {user && !user.loading && <Header />}
                                                <Routes>

                                                    {user ?
                                                        <>
                                                            <Route path="/" element={<MainPage />} />
                                                            <Route path="/laboratorios" element={<Labs />} />
                                                            <Route path="/configs" element={<Configs />} />
                                                            <Route path="laboratorio/:nome" element={<InfoLab />} />
                                                            <Route path="/login" element={<Navigate to={'/'} />} />

                                                            {user?.tipo === 'Administrador' ? (
                                                                <>
                                                                    <Route path="/reservas" element={<Reserves />} />
                                                                    <Route path="/users" element={<Users />} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {user?.tipo === 'Responsável' && (
                                                                        <Route path="/meuslaboratorios" element={<Reserves Id={user.id} />} />
                                                                    )}
                                                                    <Route path="/minhasreservas" element={<MyReserves Id={user.id} />} />
                                                                </>
                                                            )}

                                                            {!user?.loading &&
                                                                <Route path="*" element={<NotFound />} />
                                                            }
                                                        </>
                                                        :
                                                        <>
                                                            <Route path="/login" element={<LoginPage />} />
                                                            {!user?.loading &&
                                                                <Route path="*" element={<Navigate to={'/login'} />} />
                                                            }
                                                        </>
                                                    }
                                                </Routes>
                                            </div>
                                        </>
                                    )}
                                </UserContext.Consumer>
                            </section>
                        </Router>
                    </UserProvider>
                </>
            )}
            </AlertContext.Consumer>
        </AlertProvider>
    );
}

export default App;