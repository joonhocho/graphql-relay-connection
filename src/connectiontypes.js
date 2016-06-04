/* @flow */

/**
 * A flow type alias for cursors in this implementation.
 */
export type ConnectionCursor = string;


/**
 * A flow type describing the comparator that is used to sort a connection array in GraphQL.
 */
export type Comparator<T> = (a: T, b: T) => number;


export type ComparableToCursor<T> = (comparable: T) => ConnectionCursor;


export type CursorToComparable<T> = (cursor: ConnectionCursor) => T;


export type ConnectionDefinitionArguments<T> = {
  comparator: Comparator,
  comparableToCursor: ComparableToCursor;
  cursorToComparable: CursorToComparable;
};


export type ConnectionOptions = {
  hasPreviousPage: ?boolean,
  hasNextPage: ?boolean,
  sort: ?boolean,
  desc: ?boolean,
};


/**
 * A flow type designed to be exposed as `PageInfo` over GraphQL.
 */
export type PageInfo = {
  startCursor: ?ConnectionCursor,
  endCursor: ?ConnectionCursor,
  hasPreviousPage: ?boolean,
  hasNextPage: ?boolean
};


/**
 * A flow type designed to be exposed as a `Connection` over GraphQL.
 */
export type Connection<T> = {
  edges: Array<Edge<T>>;
  pageInfo: PageInfo;
};


/**
 * A flow type designed to be exposed as a `Edge` over GraphQL.
 */
export type Edge<T> = {
  node: T;
  cursor: ConnectionCursor;
};


/**
 * A flow type describing the arguments a connection field receives in GraphQL.
 */
export type ConnectionArguments = {
  before?: ?ConnectionCursor;
  after?: ?ConnectionCursor;
  first?: ?number;
  last?: ?number;
};
