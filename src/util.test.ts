import { base64, startsWith, unbase64 } from './util';

test('base64, unbase64', () => {
  expect(base64('teststring')).not.toBe('teststring');
  expect(unbase64(base64('teststring'))).toBe('teststring');

  for (let i = 0; i < 100; i += 1) {
    const s = (Math.random() * 1000).toFixed(3);
    expect(base64(s)).not.toBe(s);
    expect(unbase64(base64(s))).toBe(s);
  }
});

test('startsWith', () => {
  expect(startsWith('teststring', 'test')).toBe(true);
  expect(startsWith('teststring', 'test ')).toBe(false);
  expect(startsWith('teststring', ' test')).toBe(false);
  expect(startsWith('teststring', '')).toBe(true);
  expect(startsWith('teststring', 't')).toBe(true);
  expect(startsWith('teststring', 'teststring')).toBe(true);
  expect(startsWith('teststring', 'teststring1')).toBe(false);
});
