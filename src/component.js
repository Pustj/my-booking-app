import React, { useEffect, useState } from 'react';


function UsersList() {

  const [users, setUsers] = useState([]);


  useEffect(() => {

    fetch('http://localhost:8080/api/users')

      .then(response => response.json())

      .then(data => setUsers(data))

      .catch(error => console.error('Error fetching users:', error));

  }, []);


  return (

    <div>

      <h2>Users</h2>

      <ul>

        {users.map(user => (

          <li key={user.id}>{user.name}</li>

        ))}

      </ul>

    </div>

  );

}


export default UsersList;