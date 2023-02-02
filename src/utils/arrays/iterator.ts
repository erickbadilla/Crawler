interface INext<T> {
  value: T;
  done: boolean;
}

export function* convertArrayToGenerator<T>(array: T[]): Generator<T, void, INext<T>> {
  for (let index = 0; index < array.length; index++) {
    yield array[index];
  }
}
