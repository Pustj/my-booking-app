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
    setAuthToken(null);
    localStorage.removeItem("authToken");
  };

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ authToken, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizzato per utilizzare il contesto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere utilizzato all'interno di AuthProvider.");
  }
  return context;
};
