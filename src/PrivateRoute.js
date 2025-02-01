import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Funzione per verificare se il token è scaduto
const isTokenValid = (token) => {
  if (!token) return false; // Nessun token, non valido
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false; // Nessun payload/exp => token non valido

  const currentTimestamp = Math.floor(Date.now() / 1000); // Timestamp attuale in secondi
  return currentTimestamp < payload.exp; // True se NON ancora scaduto
};

// Funzione per decodificare il token JWT
const parseJwt = (token) => {
  if (!token) {
      console.error("Token assente o undefined."); // Log se il token non è valido
      return null;
    }
const parts = token.split(".");
  if (parts.length !== 3) {
    console.error(parts.length);
    console.error("Il token JWT non è ben formato."); // Log se il token non segue il pattern JWT
    return null;
  }

  try {
    const base64Url = token.split(".")[1]; // Ottieni la seconda parte del token (payload)
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload); // Restituisce il payload decodificato
  } catch (error) {
    console.error("Errore nella decodifica del token", error);
    return null;
  }
};


const PrivateRoute = ({ children }) => {
   const { authToken } = useAuth(); // Ottieni il token dal contesto

  // Verifica se il token è valido
  const isAuthenticated = isTokenValid(authToken);

  // Se non è autenticato, reindirizza alla pagina di login
  return isAuthenticated ? children : <Navigate to="/login" />;

};

export default PrivateRoute;