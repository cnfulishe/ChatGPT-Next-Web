const USER_VALID_URL =
  "https://public-api.zielsmart.com/v1/thirdservice/chatgpt/user/valid";
const USER_TOKEN_AUTH =
  "https://public-api.zielsmart.com/v1/thirdservice/chatgpt/user/auth";

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
  });
}

export async function userAuth(accessToken: String) {
  return await fetch(USER_TOKEN_AUTH, {
    body: JSON.stringify({
      access_token: accessToken,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}
