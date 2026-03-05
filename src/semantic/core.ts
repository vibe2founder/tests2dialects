// tests2dialects/src/semantic/core.ts
// Ghostmark core — Semantic Phantom Types
declare const __brand: unique symbol;
export type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type Bool<Name extends string> = Brand<boolean, `bool:${Name}`>;
export type Num<Name extends string>  = Brand<number,  `num:${Name}`>;
export type Str<Name extends string>  = Brand<string,  `str:${Name}`>;

export const STAMP = <B extends string>() => ({
  of: <T>(v: T) => v as Brand<T, B>,
  un: <T>(v: Brand<T, B>) => v as T,
});

export const makeBool = <N extends string>(_name: N) => ({
  of: (v: boolean) => v as Bool<N>,
  un: (v: Bool<N>) => v as boolean,
});
export const makeNum = <N extends string>(_name: N) => ({
  of: (v: number) => v as Num<N>,
  un: (v: Num<N>) => v as number,
});
export const makeStr = <N extends string>(_name: N) => ({
  of: (v: string) => v as Str<N>,
  un: (v: Str<N>) => v as string,
});
