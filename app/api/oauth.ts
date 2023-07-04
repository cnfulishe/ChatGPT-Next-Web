import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";
import { userAuth } from "./user_service";

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

export async function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);
  console.log("这是系统的accessCode" + accessCode);
  // if user does not provide an api key, inject system api key
  if (accessCode) {
    const accessAuth = await userAuth(accessCode);
    const authResult = await accessAuth.json();

    if (authResult.code == 1) {
      console.log(authResult);
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
  } else {
    return {
      error: true,
      msg: "无授权请重新登录",
    };
  }
}
