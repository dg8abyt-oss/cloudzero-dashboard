// api/verify.js
export default function handler(req, res) {
  // Get data from the frontend request
  const { password } = req.body;
  
  // Get the secret password from Vercel Settings
  const actualPassword = process.env.SITE_PASSWORD;

  if (password === actualPassword) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}
