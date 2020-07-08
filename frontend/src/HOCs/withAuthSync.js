import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { subMinutes } from "../util/sharedStaticHelpers";
import userService from "../util/userService";

const withAuthSync = (WrappedComponent) => ({ ...props }) => {
  const [jwt, setJwt] = useState(null);
  const [user, setUser] = useState(null);

  const logout = () => {
    if (jwt)
      userService.auth.userLogout(jwt.jwToken).then((res) => {
        setUser(null);
        setJwt(null);
        return res;
      });
  };

  const login = useCallback(
    (token) => {
      if (token && !user)
        userService.auth.currentUser(token.jwToken).then((res) => {
          setUser(res.data);
          setJwt(token);
        });
    },
    [user]
  );

  useEffect(() => {
    userService.auth.refreshToken().then((token) => login(token.data));
  }, []);

  useLayoutEffect(() => {
    const interval = setInterval(async () => {
      if (jwt) {
        if (
          subMinutes(new Date(jwt.jwTokenExpiry), 1) <=
          new Date(jwt.jwTokenExpiry)
        ) {
          setJwt(null);
          setJwt(await userService.auth.refreshToken());
        }
      } else {
        setJwt(await userService.auth.refreshToken());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [jwt]);

  return (
    <WrappedComponent
      jwt={jwt}
      setJwt={setJwt}
      logout={logout}
      user={user}
      login={login}
    >
      {props.children}
    </WrappedComponent>
  );
};

export { withAuthSync };
