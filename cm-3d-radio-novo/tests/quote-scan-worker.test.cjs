const test = require('node:test');
const assert = require('node:assert/strict');

test('ClamAV exit statuses fail closed on scanner errors', async () => {
  const { classifyClamAvExitCode } = await import('../scripts/lib/quote-scan-core.mjs');
  assert.equal(classifyClamAvExitCode(0), 'clean');
  assert.equal(classifyClamAvExitCode(1), 'infected');
  assert.equal(classifyClamAvExitCode(2), 'error');
  assert.equal(classifyClamAvExitCode(null), 'error');
  assert.equal(classifyClamAvExitCode(130), 'error');
});

test('quarantine worker accepts only server-issued UUID object paths', async () => {
  const { allowedQuoteObjectPath } = await import('../scripts/lib/quote-scan-core.mjs');
  const uuid1 = '01234567-89ab-4cde-8fab-0123456789ab';
  const uuid2 = '89abcdef-0123-4567-8abc-0123456789ab';
  assert.equal(allowedQuoteObjectPath(`${uuid1}/${uuid2}.3mf`), true);
  assert.equal(allowedQuoteObjectPath(`${uuid1}/${uuid2}.png`), true);
  assert.equal(allowedQuoteObjectPath('../credentials'), false);
  assert.equal(allowedQuoteObjectPath('other/path.exe'), false);
  assert.equal(allowedQuoteObjectPath(`${uuid1}/${uuid2}.stl/../../data`), false);
});
