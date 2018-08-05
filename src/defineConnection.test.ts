import { defineConnection } from './index';

const emptyFn = (): void => undefined;

describe('defineConnection()', () => {
  it('requires comparableToCursor', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: null,
        cursorToComparable: emptyFn,
        comparator: emptyFn,
      } as any)
    ).toThrow(/comparableToCursor/);
  });

  it('requires cursorToComparable', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: emptyFn,
        cursorToComparable: null,
        comparator: emptyFn,
      } as any)
    ).toThrow(/cursorToComparable/);
  });

  it('requires comparator', () => {
    expect(() =>
      defineConnection({
        comparableToCursor: emptyFn,
        cursorToComparable: emptyFn,
        comparator: null,
      } as any)
    ).toThrow(/comparator/);
  });
});
