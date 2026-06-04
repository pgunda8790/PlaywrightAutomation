import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import axios from 'axios';

export async function getSFAccessToken(): Promise<string> {
  const privateKey = fs.readFileSync('server.key', 'utf8');

  const payload = {
    iss: process.env.SF_CLIENT_ID,
    sub: process.env.SF_USERNAME,
    aud: process.env.LoginURL,
    exp: Math.floor(Date.now() / 1000) + 300,
  };

  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });

  const response = await axios.post(
    `${process.env.LoginURL}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  ).catch(err => {
    console.error('SF Auth Error:', err.response?.data);
    throw err;
  });

  return response.data.access_token;
}