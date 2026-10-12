// OFFLINE: FIND_MONACO with two '.monaco-editor.pine-editor-monaco' nodes.
// TradingView Desktop 3.4.1 puts a 0x0 stub with no React fiber before the real
// editor; querySelector took the stub and the open editor was reported closed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIND_MONACO } from '../src/core/pine.js';

function node({ width, height, editor, parent = null }) {
  const n = { parentElement: parent, getBoundingClientRect: () => ({ width, height }) };
  if (editor) {
    const env = { editor: { getEditors: () => [editor] } };
    n['__reactFiber$test'] = { memoizedProps: {}, return: { memoizedProps: { value: { monacoEnv: env } } } };
  }
  return n;
}

function find(nodes) {
  const document = { querySelectorAll: () => nodes, querySelector: () => nodes[0] || null };
  return new Function('document', 'return (' + FIND_MONACO + ')')(document);
}

test('the stub first, the real editor second: the real editor is found', () => {
  const real = { id: 'real' };
  const m = find([node({ width: 0, height: 0 }), node({ width: 1366, height: 576, editor: real })]);
  assert.ok(m);
  assert.equal(m.editor, real);
});

test('a visible editor is preferred over a zero-size one that also has a fiber', () => {
  const hidden = { id: 'hidden' }, real = { id: 'real' };
  const m = find([node({ width: 0, height: 0, editor: hidden }), node({ width: 800, height: 400, editor: real })]);
  assert.equal(m.editor, real);
});

test('one node behaves as before, whatever its size, and the fiber may sit on a parent', () => {
  const only = { id: 'only' };
  assert.equal(find([node({ width: 0, height: 0, editor: only })]).editor, only);
  const parent = node({ width: 10, height: 10, editor: only });
  assert.equal(find([node({ width: 10, height: 10, parent })]).editor, only);
});

test('no node, or only the stub, is null', () => {
  assert.equal(find([]), null);
  assert.equal(find([node({ width: 0, height: 0 })]), null);
});
