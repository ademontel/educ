import React, { createContext, useContext, useReducer } from 'react';

const UserContext = createContext();

const userReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_USERS':
      return { ...state, users: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, { users: [] });

  const fetchUsers = (users) => {
    dispatch({ type: 'FETCH_USERS', payload: users });
  };

  const addUser = (user) => {
    dispatch({ type: 'ADD_USER', payload: user });
  };

  const updateUser = (user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const deleteUser = (userId) => {
    dispatch({ type: 'DELETE_USER', payload: userId });
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/users/check-email/${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  };
  const registerUser = async (userData) => {
    console.log("UserData que se envía:", userData); // debug

    if (!userData.role) {
      return { error: "El campo 'role' es obligatorio" };
    }

    try {
      const emailExists = await checkEmailExists(userData.email);
      if (emailExists) {
        return { error: 'Este correo electrónico ya está registrado' };
      }

      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const newUser = await response.json();
        dispatch({ type: 'ADD_USER', payload: newUser });
        return { user: newUser };
      } else {
        const error = await response.json();
        return { error: error.detail || 'Error al registrar usuario' };
      }
    } catch (error) {
      console.error('Error registering user:', error);
      return { error: 'Error al registrar usuario' };
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/users/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver este perfil');
        } else if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        } else {
          throw new Error('Error al cargar el perfil');
        }
      }

      const userData = await response.json();
      return { user: userData };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { error: error.message };
    }
  };

  return (
    <UserContext.Provider value={{
      users: state.users,
      fetchUsers,
      addUser,
      checkEmailExists,
      registerUser,
      updateUser,
      deleteUser,
      getUserProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
