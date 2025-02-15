import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(); // Creazione del contesto

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    // Recupera il token da localStorage o sessionStorage se esiste
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      setAuthToken(token); // Imposta il token nello stato
    }
  }, []);

  // Funzioni per login e logout
  /**
   * Funzione login
   * @param {Object} response - La risposta del server dopo il login
   * @param {boolean} remember - Se l'utente ha selezionato "Remember me"
   */
  const login = (response, remember) => {
    const token = response.token; // Assumi che la risposta sia un oggetto JSON con chiave "token"
    setAuthToken(token);

    if (remember) {
      // Se "Remember me" è selezionato, salva il token in localStorage
      localStorage.setItem("authToken", token);
    } else {
      // Se "Remember me" NON è selezionato, salva il token in sessionStorage
      sessionStorage.setItem("authToken", token);
    }
  };

  const logout = () => {
    if (!authToken) {
      console.info("Nessun utente autenticato.");
    }
    setAuthToken(null); // Resetta lo stato
    localStorage.removeItem("authToken"); // Rimuove il token da localStorage
    sessionStorage.removeItem("authToken"); // Rimuove il token da sessionStorage
  };

  // Flag per controllare lo stato di autenticazione
  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider
      value={{ authToken, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);