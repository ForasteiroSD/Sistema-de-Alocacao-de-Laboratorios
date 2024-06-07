import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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

function PrivateRoute({ element }) {
  return (
    <UserContext.Consumer>
      {({ user }) => (
        user ? element : <Navigate to="/login" />
      )}
    </UserContext.Consumer>
  );
}

function PublicRoute({ element }) {
  return (
    <UserContext.Consumer>
      {({ user }) => (
        user ? <Navigate to="/" /> : element
      )}
    </UserContext.Consumer>
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
                {user ? <SideMenu /> : null}
                <div>
                  {user ? <Header /> : null}
                  <Routes>
                    <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
                    <Route path="/" element={<PrivateRoute element={<MainPage />} />} />
                    <Route path="/laboratorios" element={<PrivateRoute element={<Labs />} />} />
                    <Route path="/reservas" element={<PrivateRoute element={<Reserves />} />} />
                    <Route path="/configs" element={<PrivateRoute element={<Configs />} />} />
                    <Route path="/users" element={<PrivateRoute element={<Users />} />} />
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
