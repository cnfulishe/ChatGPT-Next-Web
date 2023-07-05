import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";
import { userValid, userAuthingValid } from "../api/user_service";
import BotIcon from "../icons/bot.svg";
import { useGuard, User } from "@authing/guard-react18";
import { useEffect } from "react";

export function LoginPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const goValida = async () => {
    access.updateErrorInfo("");
    if (access.account != "" && access.password != "") {
      const response = await userValid(access.account, access.password);
      const resJson = await response.json();
      if (resJson.success) {
        access.updateCode(resJson.data);
        navigate(Path.Home);
      } else {
        access.updateErrorInfo(resJson.msg);
      }
    } else {
      access.updateErrorInfo("账号和密码不能为空！");
    }
  };
  const goHome = (code: string) => {
    access.updateCode(code);
    navigate(Path.Home);
  };
  const guard = useGuard();
  guard.start("#authind-container").then((userInfo: User) => {
    console.info("用户信息:");
    console.info(userInfo.token, userInfo.id, userInfo.userPoolId);
    userAuthingValid(userInfo.token ?? "", userInfo.id, userInfo.userPoolId)
      .then((res) => res.json())
      .then((resJson) => {
        console.log(resJson);
        if (resJson.success) {
          goHome(resJson.data);
        } else {
        }
      });
  });
  return (
    <div id="authind-container"></div>
    // <div className={styles["auth-page"]}>
    //   <div className={`no-dark ${styles["auth-logo"]}`}>
    //     <BotIcon />
    //   </div>
    //
    //   <div className={styles["auth-title"]}>{Locale.Auth.Title}</div>
    //
    //   <div className={styles["auth-tips"]}>{Locale.Auth.Tips}</div>
    //
    //   {access.errorInfo != "" ? (
    //     <div className={styles["error-info"]}>
    //       <span>{access.errorInfo}</span>
    //     </div>
    //   ) : (
    //     <div className={styles["error-info"]} />
    //   )}
    //   <div>
    //     工号:&nbsp;&nbsp;
    //     <input
    //       className={styles["auth-input"]}
    //       type="text"
    //       placeholder={Locale.Auth.Account}
    //       value={access.account}
    //       onChange={(e) => {
    //         access.updateErrorInfo("");
    //         access.updateAccount(e.currentTarget.value);
    //       }}
    //     />
    //     &nbsp;&nbsp;&nbsp;&nbsp; 将军令:&nbsp;&nbsp;
    //     <input
    //       className={styles["auth-input"]}
    //       type="password"
    //       placeholder={Locale.Auth.Input}
    //       value={access.password}
    //       onChange={(e) => {
    //         access.updateErrorInfo("");
    //         access.updatePassword(e.currentTarget.value);
    //       }}
    //     />
    //   </div>
    //
    //   <div className={styles["auth-actions"]}>
    //     <IconButton
    //       text={Locale.Auth.Confirm}
    //       type="primary"
    //       onClick={goValida}
    //     />
    //     <IconButton text={Locale.Auth.Later} onClick={goBack} />
    //   </div>
    // </div>
  );
}
