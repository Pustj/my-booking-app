import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { jwtDecode } from 'jwt-decode';
//import React, { useState, useEffect, createContext, useContext } from "react";

// Funzione per verificare se il token è scaduto
const isTokenValid = (token) => {

  if (!token) return false; // Nessun token, non valido
  try {
      const decoded = jwtDecode(token);

      if (!decoded.exp) return false;

      const currentTimestamp = Math.floor(Date.now() / 1000); // Timestamp attuale in secondi

      return currentTimestamp < decoded.exp; // True se NON ancora scaduto
  } catch (error) {
      console.error("Errore nella decodifica del token", error);
      return null;
  }
};


const PrivateRoute = ({ children }) => {

   const { authToken } = useAuth(); // Ottieni il token dal contesto
    const location = useLocation();

  // Controlla se il contesto sta ancora inizializzando il token
  if (authToken === null) {
    // Mostra uno stato di caricamento mentre il token è in fase di verifica
    return <div>Caricamento...</div>;
  }



  const isAuthenticated = isTokenValid(authToken);
  // Se non è autenticato, reindirizza alla pagina di login
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }}/>;

};

export default PrivateRoute;