import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';
import '../index.css';

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addUser, updateUser } = useUserContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const response = await fetch(`http://localhost:8000/users/${id}`);
          if (response.ok) {
            const user = await response.json();
            setFormData({ ...user, password: '' });
          } else if (response.status === 401) {
            navigate('/login');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = id 
      ? `http://localhost:8000/users/${id}`
      : 'http://localhost:8000/users/';
    const method = id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const user = await response.json();
        if (id) {
          updateUser(user);
        } else {
          addUser(user);
        }
        navigate('/users');
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="user-form">
      <h2>{id ? 'Edit User' : 'Create User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
            required={!id}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            {id ? 'Update' : 'Create'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/users')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;