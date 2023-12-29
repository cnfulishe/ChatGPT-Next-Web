import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX, ModelProvider } from "../constant";
import { userTokenAuth } from "./user_service";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

export async function authHandler(
  req: NextRequest,
  modelProvider: ModelProvider,
) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);

  // if user does not provide an api key, inject system api key
  if (accessCode != undefined) {
    try {
      console.log("现在进行accessAuth:" + accessCode);
      const accessAuth = await userTokenAuth(accessCode);

      const authResult = await accessAuth.json();
      console.log("结束请求accessAuth:" + authResult.code);
      if (authResult.code == 1) {
        let apiKey = authResult.data;
        console.log("[Auth] use system api key");
        req.headers.set("Authorization", `Bearer ${apiKey}`);
        return {
          error: false,
        };
      } else {
        return {
          error: true,
          msg: authResult.msg,
          code: authResult.code,
        };
      }
    } catch (e) {
      return {
        error: true,
        msg: e,
      };
    }
  } else {
    return {
      error: true,
      msg: "无授权请重新登录",
    };
  }
}
