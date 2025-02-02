import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(); // Creazione del contesto

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Recupera il token da localStorage se esiste
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token); // Imposta il token nello stato
    }
  }, []);

  // Funzioni per login e logout
  const login = (response) => {
    const token = response.token; // Assumi che la risposta sia un oggetto JSON con chiave "token"
    setAuthToken(token);
    localStorage.setItem("authToken", token);
  };

  const logout = () => {
      if (!authToken) {
        console.info("Nessun utente autenticato.");
      }
      setAuthToken(null); // Resetta lo stato
      localStorage.removeItem("authToken"); // Rimuove il token
    };


  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

