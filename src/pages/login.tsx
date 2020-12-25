import classnames from "classnames";
import { useRouter } from "next/router";
import qs from "query-string";
import React from "react";

import { Input } from "src/components/Input";
import { KeepRatio } from "src/components/KeepRatio";
import { UserServiceContext } from "src/contexts/userContext";
import styles from "src/styles/login.module.scss";
import Logo from "src/svg/logo.svg";

type User = {
  username: string;
  password: string;
};

const Login: React.FC = () => {
  const router = useRouter();
  const { login } = React.useContext(UserServiceContext);
  const redirect = React.useRef<string>("/");

  const [user, setUser] = React.useState<User>({
    username: "",
    password: "",
  });

  React.useEffect(() => {
    try {
      redirect.current = decodeURI((qs.parse(window.location.search).redirect as string) || "/");
    } catch (e) {
      redirect.current = "/";
    }
  }, []);

  const updateUsername = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUser((u) => ({ ...u, username: e.target.value }));
  };
  const updatePassword = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUser((u) => ({ ...u, password: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await login(user.username, user.password, false);
    if (response.success) {
      router.push(redirect.current);
    }
  };

  return (
    <div className="bg-gradiant">
      <KeepRatio ratio={0.45} width="95%" maxWidth="1200px" className={styles.LoginContainer}>
        <div className={styles.LoginPanel}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "0.8em" }}>
            <Logo style={{ width: "2.4em", height: "auto" }} />
            <h1 className="title" style={{ marginLeft: "0.5em" }}>
              1 Village
            </h1>
          </div>
          <p style={{ marginBottom: "3em" }}>Se connecter</p>
          <form onSubmit={onSubmit} style={{ width: "95%", maxWidth: "300px" }}>
            <Input
              label="Adresse email"
              placeholder="Entrez votre adresse email"
              name="username"
              value={user.username}
              fullWidth
              onChange={updateUsername}
              style={{ marginBottom: "2em" }}
            />
            <Input
              label="Mot de passe"
              placeholder="Entrez votre mot de passe"
              name="password"
              type="password"
              value={user.password}
              fullWidth
              onChange={updatePassword}
              style={{ marginBottom: "2em" }}
            />
            <button>Se connecter</button>
          </form>
        </div>
        <div className={classnames(styles.LoginPanel, styles["LoginPanel--blue"])}></div>
      </KeepRatio>
    </div>
  );
};

export default Login;
