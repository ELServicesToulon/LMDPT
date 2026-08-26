/**
 * Magic link LMDPT — wrap @ks5b/auth-idp (SMTP OVH + copy LMDPT).
 */
import { publicUrl } from './config.mjs';
import { idp } from './load-idp.mjs';

const {
  createMagicToken: idpCreateMagicToken,
  consumeMagicToken,
  rateLimit,
  sendSmtp,
  sendMagicEmail: idpSendMagicEmail,
  resolveAuthConfig,
} = idp;

export { consumeMagicToken, rateLimit, sendSmtp };

function idpConfig() {
  return resolveAuthConfig({
    envPrefix: 'LMDPT',
    publicUrl: publicUrl(),
    env: process.env,
    brand: {
      subject: 'Connexion LMDPT — lien magique',
      appName: 'Le Média du Premier Tour',
      footerUrl: 'https://lmdpt.iarbre.org',
      fromName: 'LMDPT',
      ehloHost: 'lmdpt.iarbre.org',
      logTag: 'lmdpt-auth',
    },
  });
}

export function createMagicToken(dataDir, email) {
  return idpCreateMagicToken(dataDir, email, { publicUrl: publicUrl() });
}

export async function sendMagicEmail({ to, verifyUrl }) {
  return idpSendMagicEmail({
    to,
    verifyUrl,
    config: idpConfig(),
  });
}
