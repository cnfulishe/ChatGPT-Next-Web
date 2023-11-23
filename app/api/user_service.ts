const USER_VALID_URL =
  "https://ekey.zielsmart.com/sso/authing/chatgpt/user/valid";
const USER_TOKEN_AUTH =
  "https://ekey.zielsmart.com/sso/authing/chatgpt/user/auth";

const USER_AUTHING_VALID_URL =
  "https://ekey.zielsmart.com/sso/authing/chatgpt/user/authingValid";

export async function userValid(account: String, password: String) {
  return await fetch(USER_VALID_URL, {
    body: JSON.stringify({
      account: account,
      password: password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    mode: "cors",
  });
}

export async function userTokenAuth(accessToken: String) {
  return await fetch(USER_TOKEN_AUTH, {
    body: JSON.stringify({
      access_token: accessToken,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    mode: "cors",
  });
}

export async function userAuthingValid(
  idToken: String,
  userId: String,
  userPoolId: String,
) {
  return await fetch(USER_AUTHING_VALID_URL, {
    body: JSON.stringify({
      userId: userId,
      userPoolId: userPoolId,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `${idToken}`,
    },
    method: "POST",
    mode: "cors",
  });
}
