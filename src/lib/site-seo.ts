export const SITE_URL = "https://cmangini3d.com.br";

// Nunca expor previews, builds locais ou ambientes desconhecidos à indexação.
export function isIndexableDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}
