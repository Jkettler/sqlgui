import React, { Component, useState, useEffect, useLayoutEffect } from "react";

import axios from "axios";

const apiUrl = "http://localhost:9000";
const refreshUrl = `${apiUrl}/refresh-token`;
const getCurrentUserUrl = `${apiUrl}/api/users/current`;
const logoutUrl = `${apiUrl}/logout`;

const subMinutes = function (dt, minutes) {
  return new Date(dt.getTime() - minutes * 60000);
};

const refreshToken = () => {
  return axios
    .post(refreshUrl, {}, { withCredentials: true })
    .then((res) => {
      return res.data;
    })
    .catch((e) => {});
};

const logout = () => {
  return axios.post(logoutUrl, {}, { withCredentials: true }).then((res) => {
    return res;
  });
};

const getAndSetUser = (setFunc) => {
  axios.get(getCurrentUserUrl).then((res) => setFunc(res.data));
};

const withAuthSync = (WrappedComponent) => ({ ...props }) => {
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);

  const login = (token) => {
    setJwt(token);
    getAndSetUser(setUser);
  };

  useLayoutEffect(() => {
    refreshToken().then((res) => {
      if (res) login(res);
    });
  }, []);

  useLayoutEffect(() => {
    const interval = setInterval(async () => {
      if (jwt) {
        if (
          subMinutes(new Date(jwt.jwTokenExpiry), 1) <=
          new Date(jwt.jwTokenExpiry)
        ) {
          setJwt(null);
          setJwt(await refreshToken());
        }
      } else {
        setJwt(await refreshToken());
      }
    }, 60000);

    // window.addEventListener("storage", this.syncLogout);
    return () => clearInterval(interval);
  }, []);

  return (
    <WrappedComponent
      {...props}
      jwt={jwt}
      setJwt={setJwt}
      logout={logout}
      user={user}
      setUser={setUser}
    />
  );
};

export { withAuthSync, logout, getAndSetUser };
