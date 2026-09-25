// OFFLINE: the pine_check response carries imports and functions2 through.
// private_pinescriptTransformation AUDIT 4.244. check() used to read errors2
// and drop every other field; the dropped fields held each library's page id.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { check } from '../src/core/pine.js';

const IMPORTS = [{ user: 'CharonQuant', lib: 'Backtesting', version: '3.0',
  chartId: 'b9pEbaQZ', libId: 'CharonQuant/Backtesting/3' }];
const FUNCS = [{ name: 'curve', desc: ['equity curve'] }];

function stub(body) {
  const real = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => body });
  return () => { globalThis.fetch = real; };
}

test('imports and functions2 are returned as sent, and every field is named', async () => {
  const undo = stub({ success: true, result: { errors2: [], warnings2: [],
    imports: IMPORTS, functions2: FUNCS, variables2: [] } });
  try {
    const r = await check({ source: 'x' });
    assert.equal(r.compiled, true);
    assert.deepEqual(r.imports, IMPORTS);
    assert.deepEqual(r.functions2, FUNCS);
    assert.deepEqual(r.result_fields, ['errors2', 'functions2', 'imports', 'variables2', 'warnings2']);
    assert.deepEqual(r.response_fields, ['result', 'success']);
    assert.deepEqual(r.result_other, { variables2: [] });
  } finally { undo(); }
});

test('a response without them says null, not absent', async () => {
  const undo = stub({ success: false, error: 'boom' });
  try {
    const r = await check({ source: 'x' });
    assert.equal(r.compiled, false);
    assert.equal(r.imports, null);
    assert.equal(r.functions2, null);
    assert.deepEqual(r.result_fields, []);
    assert.deepEqual(r.result_other, {});
  } finally { undo(); }
});
