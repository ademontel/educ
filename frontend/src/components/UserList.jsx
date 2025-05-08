import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

function UserList() {
  const navigate = useNavigate();
  const { users, fetchUsers, deleteUser } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/users/');
        if (response.ok) {
          const data = await response.json();
          fetchUsers(data);
        } else if (response.status === 401) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, [fetchUsers, navigate]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        deleteUser(id);
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div>
      <h2>Users List</h2>
      <Link to="/users/new" className="btn btn-primary mb-3">Add New User</Link>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>
                <Link to={`/users/${user.id}`} className="btn btn-sm btn-info me-2">Edit</Link>
                <button 
                  onClick={() => handleDelete(user.id)} 
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;