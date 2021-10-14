import axios from "axios";

export default async function handler(req: any, res: any) {
  const { token } = req.body;
  const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
  const { data }: any = await axios(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
  })
res.status(200).json({ success: !!data.success })
}