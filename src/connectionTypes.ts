export type ConnectionCursor = string;

export type Comparator<Comparable> = (a: Comparable, b: Comparable) => number;

export type ComparableToCursor<Comparable> = (
  comparable: Comparable
) => ConnectionCursor;

export type CursorToComparable<Comparable> = (
  cursor: ConnectionCursor
) => Comparable | null;

export interface ConnectionDefinitionArguments<Comparable> {
  comparator: Comparator<Comparable>;
  comparableToCursor: ComparableToCursor<Comparable>;
  cursorToComparable: CursorToComparable<Comparable>;
}

export interface ConnectionOptions {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  sorted: boolean;
  desc: boolean;
}

export interface PageInfo {
  startCursor: ConnectionCursor | null;
  endCursor: ConnectionCursor | null;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Connection<Node> {
  edges: Array<Edge<Node>>;
  pageInfo: PageInfo;
}

export interface Edge<Node> {
  node: Node;
  cursor: ConnectionCursor;
}

export type Nil = undefined | null;

export type ConnectionArguments =
  | {
      before?: ConnectionCursor | Nil;
      after?: ConnectionCursor | Nil;
      first?: Nil;
      last?: Nil;
    }
  | {
      before?: ConnectionCursor | Nil;
      after?: ConnectionCursor | Nil;
      first: number;
      last?: Nil;
    }
  | {
      before?: ConnectionCursor | Nil;
      after?: ConnectionCursor | Nil;
      first?: Nil;
      last: number;
    };
