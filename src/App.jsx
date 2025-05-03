// import React from "react";
// import ProductList from "./components/ProductList";
// import "./App.css";

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Price Monitoring</h1>
//       </header>
//       <div className="App-body">
//         <aside className="App-sidebar">{/* Sidebar empty for now */}</aside>
//         <main className="App-main">
//           <ProductList />
//         </main>
//       </div>
//       <footer className="App-footer">
//         &copy; {new Date().getFullYear()} Sistema de Produtos
//       </footer>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect } from "react";
import LoginForm from "./components/auth/LoginForm";
import ProductList from "./components/ProductList";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/auth/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.is_valid) {
              setIsLoggedIn(true);
            } else {
              localStorage.removeItem('accessToken'); // Invalid token, remove from localStorage
              setIsLoggedIn(false);
            }
          } else {
            console.error('Erro ao verificar o token');
            localStorage.removeItem('accessToken');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Erro ao comunicar com o servidor para verificar o token:', error);
          localStorage.removeItem('accessToken');
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Price Monitoring</h1>
        {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
      </header>
      <div className="App-body">
        <main className="App-main">
          {isLoggedIn ? (
            <ProductList setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}
        </main>
      </div>
      <footer className="App-footer">
        &copy; {new Date().getFullYear()} Sistema de Produtos
      </footer>
    </div>
  );
}

export default App;
