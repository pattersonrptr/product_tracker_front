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
        // Here you can add logic to check if the token is still valid
        // (decode the JWT and check the expiration date, for example).
        // For a more secure verification, you would make an API call.
        // For now, let's just assume that if the token exists, the user is logged in.
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
