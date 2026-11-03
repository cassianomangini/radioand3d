const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const SAFE_PATH = new RegExp(`^${UUID}/${UUID}\\.(?:stl|3mf|pdf|png|jpg|jpeg|webp)$`, 'i');

export function allowedQuoteObjectPath(path) {
  return typeof path === 'string' && SAFE_PATH.test(path);
}

export function classifyClamAvExitCode(exitCode) {
  if (exitCode === 0) return 'clean';
  if (exitCode === 1) return 'infected';
  return 'error';
}
