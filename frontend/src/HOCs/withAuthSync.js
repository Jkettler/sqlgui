import React, { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useJwt } from "../contexts/JwtContext";

import { subMinutes } from "../util/sharedStaticHelpers";
import userService from "../util/authService";

const withAuthSync = (WrappedComponent) => ({ ...props }) => {
  const { jwt, setJwt } = useJwt();
  const { user, setUser } = useUser();

  const logout = () => {
    if (jwt)
      userService.auth.userLogout(jwt.jwToken).then(() => {
        setJwt(null);
        setUser(null);
      });
  };

  useEffect(() => {
    if (jwt && !user) {
      userService.auth
        .currentUser(jwt.jwToken)
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => setUser(null));
    }
  }, [setUser, jwt, user]);

  // Load user immediately on initial render, if possible
  useEffect(() => {
    userService.auth.refreshToken(setJwt).then(() => Promise.resolve());
  }, [setJwt]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (jwt) {
        if (
          subMinutes(new Date(jwt.jwTokenExpiry), 1) <=
          new Date(jwt.jwTokenExpiry)
        ) {
          setJwt(null);
          await userService.auth.refreshToken(setJwt, interval);
        }
      } else {
        await userService.auth.refreshToken(setJwt, interval);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [setJwt, jwt]);

  return <WrappedComponent logout={logout}>{props.children}</WrappedComponent>;
};

export { withAuthSync };
