// App.js
import { Routes, Route } from 'react-router-dom';

import NavBar from "./components/NavBar";
import Test from './test';
import UsersList from './component';


const App = () => {
   return (
      <>
        <NavBar />
         <Routes>
            <Route path="/" element={<Test />} />
            <Route path="/users" element={<UsersList />} />
         </Routes>
      </>
   );
};

export default App;