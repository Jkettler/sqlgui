import React, { createContext, useContext, useState, useMemo } from "react";

const UserContext = createContext();

const useUser = () => {
  const context = useContext(UserContext);

  if (!context)
    throw new Error(`useContext must be used within a UserProvider`);

  return context;
};

const UserProvider = (props) => {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({ user, setUser }), [user]);

  return <UserContext.Provider value={value} {...props} />;
};

export { UserProvider, useUser };
