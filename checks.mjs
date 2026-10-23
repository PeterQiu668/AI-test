import assert from 'node:assert/strict';
import { questions, dimensions, cases, scenarios, calculate, findings, opportunity, matchCases, sample } from './model.mjs';

assert.equal(questions.length, 18);
assert.equal(dimensions.reduce((n, d) => n + d.weight, 0), 100);
for (const q of questions) { assert.equal(q.options.length, 4, q.id); assert.equal(q.notes.length, 4, q.id); assert.ok(q.gap && q.fix, q.id); }
for (const c of cases) assert.ok(c.url.startsWith('https://'), c.company);

const all = v => Object.fromEntries(questions.map(q => [q.id, v]));
assert.equal(calculate(all(0)).score, 0);
assert.equal(calculate(all(3)).score, 100);
assert.equal(calculate(all(3)).level.id, 'L5');
assert.equal(calculate({}).score, null, 'too few answers gives no score');
// "不确定" (-1) is excluded, not scored as zero.
const unsure = { ...all(3), d1: -1 };
assert.equal(calculate(unsure).score, 100);
assert.equal(calculate(unsure).unsure, 1);

const r = calculate(sample.answers);
assert.ok(r.score > 30 && r.score < 60, `sample score ${r.score}`);
assert.equal(findings(sample.answers).bottlenecks.length, 3);
const o = opportunity(scenarios[0], { freq: 25, minutes: 15, risk: 1 }, { knowledge: 50, workflow: 50 });
assert.ok(o.value > 0 && o.value <= 100 && o.ready === 42);
assert.ok(matchCases({ industry: '电商零售', picked: ['service'] }).every(c => c.hit.length));
console.log('checks ok · sample score', r.score, r.level.id);
