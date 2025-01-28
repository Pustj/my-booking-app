// App.js
import { Routes, Route } from 'react-router-dom';

import NavBar from "./components/NavBar";
import Test from './components/test';
import UsersList from './components/usersList';
import ScheduleSelectorComponent from './components/ScheduleSelector';


const App = () => {
   return (
      <>
        <NavBar />
         <Routes>
            <Route path="/" element={<Test />} />
            <Route path="/users" element={<UsersList />} />
         </Routes>
        <ScheduleSelectorComponent />
      </>
   );
};

export default App;