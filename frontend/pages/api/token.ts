// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { POLYGON_API_BASE_URL } from "../../consts";

type Data = {
  token: string;
};

export const generateTokenFunc = async () => {
  const tokenRes = await axios({
    method: "post",
    url: `${POLYGON_API_BASE_URL}/v1/orgs/sign-in`,
    data: {
      email: `${process.env.POLYGON_ID_ORG_EMAIL}`,
      password: `${process.env.POLYGON_ID_ORG_PASSWORD}`,
    },
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "identity",
    },
  });

  const token = tokenRes.data.token || "";

  return token;
};

export default async function generateToken(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const token = await generateTokenFunc();

  res.status(200).json({ token });
}
