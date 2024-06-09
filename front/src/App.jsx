import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

/* Components */
import SideMenu from "./components/SideMenu";
import Header from './components/Header';

/* Pages */
import MainPage from './pages/MainPage';
import Labs from './pages/Labs';
import Reserves from './pages/Reserves';
import Configs from './pages/Configs';
import Users from "./pages/Users";
import LoginPage from "./pages/LoginPage";

/* Context */
import { UserProvider, UserContext } from './context/UserContext';

/* Css */
import './App.css';

function Minhas() {
  return (
    <h1>Minhas</h1>
  )
}

function NotFound() {
  return (
    <div className='flex v h c PageContent'>
      <h1>Página Não Encontrada</h1>
      <h3><Link to='/' style={{ textDecoration: 'none'}}>Clique para voltar para página principal</Link></h3>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <section className="flex">
          <UserContext.Consumer>
            {({ user }) => (
              <>
                {user && <SideMenu />}
                <div>
                  {user && <Header />}
                  <Routes>

                    {user ?
                      <>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/laboratorios" element={<Labs />} />
                        <Route path="/configs" element={<Configs />} />
                        <Route path="/login" element={<Navigate to={'/'} />} />

                        {user?.tipo === 'Administrador' ? (
                          <>
                            <Route path="/reservas" element={<Reserves />} />
                            <Route path="/users" element={<Users />} />
                          </>
                        ) : (
                          <>
                            {user?.tipo === 'Responsável' && (
                              <Route path="/meuslaboratorios" element={<Reserves />} />
                            )}
                            <Route path="/minhasreservas" element={<Minhas />} />
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
  );
}

export default App;
