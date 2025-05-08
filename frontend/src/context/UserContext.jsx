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

  return (
    <UserContext.Provider value={{ 
      users: state.users, 
      fetchUsers, 
      addUser, 
      updateUser, 
      deleteUser 
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