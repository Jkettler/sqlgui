import React, { createContext, useContext, useState, useMemo } from "react";

const JwtContext = createContext(null);

const useJwt = () => {
  const context = useContext(JwtContext);

  if (!context) throw new Error(`useContext must be used within a JwtProvider`);

  return context;
};

const JwtProvider = (props) => {
  const [jwt, setJwt] = useState(null);

  const value = useMemo(() => ({ jwt, setJwt }), [jwt]);

  return <JwtContext.Provider value={value} {...props} />;
};

export { JwtProvider, useJwt };
