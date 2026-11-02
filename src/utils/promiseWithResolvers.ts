/**
 * Polyfill for Promise.withResolvers() (ECMAScript 2024).
 * Required by pdfjs-dist 4.x / react-pdf 9.x in Node.js < 22 (e.g. Node 20 in CI)
 * and older browsers (Chrome < 119, Safari < 17.4, Firefox < 121).
 */
declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    };
  }
}

if (typeof Promise.withResolvers === "undefined") {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export {};
