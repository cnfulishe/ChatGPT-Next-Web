import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_API_HOST, DEFAULT_MODELS, StoreKey } from "../constant";
import { getHeaders } from "../client/api";
import { BOT_HELLO } from "./chat";
import { getClientConfig } from "../config/client";
import { User } from "@authing/guard-react18";

export interface UserInfo {
  userName: string | undefined;
  userAvatar: string | undefined;
}
export interface AccessControlStore {
  accessCode: string;
  token: string;

  needCode: boolean;
  hideUserApiKey: boolean;
  hideBalanceQuery: boolean;
  disableGPT4: boolean;

  openaiUrl: string;

  account: string;
  password: string;
  errorInfo: string;
  userInfo: UserInfo | undefined;
  updateUserInfo: (_: UserInfo) => void;
  updateErrorInfo: (_: string) => void;
  updateAccount: (_: string) => void;
  updatePassword: (_: string) => void;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  updateOpenAiUrl: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;
}

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? DEFAULT_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      needCode: true,
      hideUserApiKey: true,
      hideBalanceQuery: false,
      disableGPT4: false,
      openaiUrl: DEFAULT_OPENAI_URL,
      account: "",
      password: "",
      errorInfo: "",
      userInfo: undefined,
      updateUserInfo(userInfo: UserInfo) {
        set(() => ({ userInfo: userInfo }));
      },
      updateErrorInfo(errorInfo: string) {
        set(() => ({ errorInfo: errorInfo }));
      },
      enabledAccessControl() {
        get().fetch();
        return get().needCode;
      },
      updateAccount(account: string) {
        set(() => ({ account: account?.trim() }));
      },
      updatePassword(password: string) {
        set(() => ({ password: password?.trim() }));
      },
      updateCode(code: string) {
        set(() => ({ accessCode: code?.trim() }));
      },
      updateToken(token: string) {
        set(() => ({ token }));
      },
      updateOpenAiUrl(url: string) {
        set(() => ({ openaiUrl: url?.trim() }));
      },
      isAuthorized() {
        get().fetch();

        // has token or has code or disabled access control
        return (
          !!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },
      fetch() {
        if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
            console.log("[Config] got config from server", res);
            set(() => ({ ...res }));

            if (res.disableGPT4) {
              DEFAULT_MODELS.forEach(
                (m: any) => (m.available = !m.name.startsWith("gpt-4")),
              );
            }
          })
          .catch(() => {
            console.error("[Config] failed to fetch config");
          })
          .finally(() => {
            fetchState = 2;
          });
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
