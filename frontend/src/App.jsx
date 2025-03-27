import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import './App.css';
import Header from './components/Header';
import Renovation from './components/Renovation';
import routes from './routes';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { HIDE_RENOVATION_PATHS } from './constants';

function AppContent() {
  const location = useLocation();

  const authContext = useContext(AuthContext);
  const isLoading = authContext?.isLoading;

  const shouldShowRenovation = !HIDE_RENOVATION_PATHS.includes(location.pathname);

  if (isLoading) {
    return <div>Loading...</div>; // add custom loader later
  }

  return (
    <>
      <Header />
      {shouldShowRenovation && <Renovation />}
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;