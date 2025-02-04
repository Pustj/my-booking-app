// App.js
import { Routes, Route } from 'react-router-dom';

import NavBar from "./components/NavBar";
import Test from './test';
import UsersList from './component';
import { DatePicker } from 'antd';

const App = () => {
   return (
      <>
        <NavBar />
         <Routes>
            <Route path="/" element={<Test />} />
            <Route path="/users" element={<UsersList />} />
         </Routes>

         <DatePicker />
      </>
   );
};

export default App;