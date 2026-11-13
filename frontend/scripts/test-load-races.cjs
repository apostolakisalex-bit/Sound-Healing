// Exercise the actual useLoad function with controlled network promises.
// This small lifecycle harness does not replace browser/React integration tests.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const filename = path.join(__dirname, '../src/components/Wellness.tsx');
const source = ts.createSourceFile(filename, fs.readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const hook = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'useLoad');
assert.ok(hook, 'useLoad must exist');
const code = ts.transpileModule(hook.getText(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;

function setup() {
  const slots = []; const requests = []; const effects = [];
  let index = 0; let writes = 0; let current;
  const context = {
    exports: {}, AbortController,
    useRef(value) { const i = index++; return slots[i] ??= { current: value }; },
    useState(value) {
      const i = index++; if (!(i in slots)) slots[i] = value;
      return [slots[i], next => { slots[i] = next; writes++; }];
    },
    useCallback(fn, deps) {
      const i = index++;
      if (!slots[i] || slots[i].deps[0] !== deps[0]) slots[i] = { fn, deps };
      return slots[i].fn;
    },
    useEffect(fn, deps) {
      const i = index++;
      if (!slots[i] || slots[i].dep !== deps[0]) {
        effects.push(() => { slots[i]?.cleanup?.(); slots[i] = { dep: deps[0], cleanup: fn() }; });
      }
    },
    api: { get(url, options) {
      return new Promise((resolve, reject) => requests.push({ url, signal: options.signal, resolve, reject }));
    } },
  };
  vm.runInNewContext(code, context);
  return {
    requests,
    render(url = '/first') {
      index = 0; current = context.exports.useLoad(url, []);
      while (effects.length) effects.shift()();
      return current;
    },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
    get writes() { return writes; },
  };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('late response from a previous filter cannot overwrite the new result', async () => {
  const h = setup(); h.render('/L1'); h.render('/L2');
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[1].resolve({ data: ['L2'] }); await flush();
  h.requests[0].resolve({ data: ['L1'] }); await flush();
  const state = h.render('/L2');
  assert.deepEqual(state.data, ['L2']); assert.equal(state.loading, false); assert.equal(state.error, '');
});

test('superseded failure cannot clear loading or show an error', async () => {
  const h = setup(); let state = h.render();
  const latest = state.reload();
  h.requests[0].reject(new Error('old request failed')); await flush();
  state = h.render(); assert.equal(state.loading, true); assert.equal(state.error, '');
  h.requests[1].resolve({ data: ['latest'] }); await latest;
  assert.deepEqual(h.render().data, ['latest']);
});

test('unmount cancels work and prevents later state writes', async () => {
  const h = setup(); h.render(); h.unmount(); const writes = h.writes;
  assert.equal(h.requests[0].signal.aborted, true);
  h.requests[0].resolve({ data: ['late'] }); await flush();
  assert.equal(h.writes, writes);
});

test('refresh removes stale actions and a genuine failure can be retried', async () => {
  const h = setup(); h.render(); h.requests[0].resolve({ data: ['old'] }); await flush();
  let state = h.render(); assert.deepEqual(state.data, ['old']);
  const failed = state.reload(); assert.equal(h.render().data.length, 0);
  h.requests[1].reject(new Error('offline')); await failed;
  state = h.render(); assert.ok(state.error); assert.equal(state.loading, false);
  const retry = state.reload(); h.requests[2].resolve({ data: ['recovered'] }); await retry;
  state = h.render(); assert.deepEqual(state.data, ['recovered']); assert.equal(state.error, '');
});
