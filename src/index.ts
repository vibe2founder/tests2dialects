import { Str } from "./semantic/core.js";

// ============================================================================
// 1. ATOMIC CORE ENGINE (O Motor)
// ============================================================================

export type SuiteName = Str<"SuiteName">;
export type TestCaseName = Str<"TestCaseName">;
export type HookType = "beforeAll" | "afterAll" | "beforeEach" | "afterEach";

type VoidFn = () => void | Promise<void>;

interface SuiteNode {
  name: SuiteName | "ROOT";
  tests: { name: TestCaseName; fn: VoidFn }[];
  hooks: Record<HookType, VoidFn[]>;
  parent?: SuiteNode;
}

class AtomicCore {
  private static instance: AtomicCore;
  private rootSuite: SuiteNode = {
    name: "ROOT",
    tests: [],
    hooks: { beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] },
  };
  private currentSuite: SuiteNode = this.rootSuite;
  private suiteStarted = new Set<SuiteNode>();

  static get() {
    if (!AtomicCore.instance) AtomicCore.instance = new AtomicCore();
    return AtomicCore.instance;
  }

  // --- Atomic Actions ---

  defineGroup(name: SuiteName | string, fn: VoidFn) {
    const parent = this.currentSuite;
    const newSuite: SuiteNode = {
      name: name as SuiteName,
      tests: [],
      hooks: { beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] },
      parent,
    };

    this.currentSuite = newSuite;
    try {
      fn();
      newSuite.hooks.afterAll.forEach((h) => h());
    } finally {
      this.currentSuite = parent;
    }
  }

  defineCase(name: TestCaseName | string, fn: VoidFn) {
    this.runTestSafe(this.currentSuite, name as TestCaseName, fn);
  }

  addHook(type: HookType, fn: VoidFn) {
    this.currentSuite.hooks[type].push(fn);
  }

  // --- Internal Runner Logic ---

  private async runTestSafe(suite: SuiteNode, name: TestCaseName, fn: VoidFn) {
    // Run beforeAll if first test in this suite
    if (!this.suiteStarted.has(suite)) {
      suite.hooks.beforeAll.forEach((h) => h());
      this.suiteStarted.add(suite);
    }

    try {
      // Run BeforeEach hooks
      suite.hooks.beforeEach.forEach((h) => h());

      await fn();

      // Run AfterEach hooks
      suite.hooks.afterEach.forEach((h) => h());
    } catch (_e) {
      // Handle failure silently in core, or emit event for reporter
    }
  }

  reset() {
    this.rootSuite = {
      name: "ROOT",
      tests: [],
      hooks: { beforeAll: [], afterAll: [], beforeEach: [], afterEach: [] },
    };
    this.currentSuite = this.rootSuite;
    this.suiteStarted.clear();
  }
}

const core = AtomicCore.get();

export const resetAtomicCore = () => core.reset();

// ... (UniversalMockHandler, UniversalAssertion, Dialects logic remains, just update signatures if needed)
// Using ... to represent that the rest of the file stays largely the same but with potential type updates
// Actually I need to provide the full content or important chunks. I'll replace the whole file to be safe with types.

// ============================================================================
// 2. UNIVERSAL MOCK (O Ator/Dublê)
// ============================================================================

class UniversalMockHandler {
  public calls: any[][] = [];
  private impl: ((...args: any[]) => any) | null = null;
  private defaultReturn: any = undefined;
  private isResolved: boolean = false;
  private parent: UniversalMockHandler | null = null;

  constructor(originalImpl?: (...args: any[]) => any) {
    this.impl = originalImpl || null;
  }

  setParent(parent: UniversalMockHandler) {
    this.parent = parent;
  }

  // O método que é chamado quando alguém invoca o mock
  invoke(...args: any[]) {
    this.calls.push(args);
    // Notifica o pai que houve uma interação (útil para to(obj).wasCalled())
    if (this.parent) this.parent.invoke(...args);

    if (this.impl) return this.impl(...args);
    if (this.isResolved) return Promise.resolve(this.defaultReturn);
    return this.defaultReturn;
  }

  // --- Setup Methods (Aliases Internos) ---
  setReturn(val: any) {
    this.defaultReturn = val;
    this.isResolved = false;
  }
  setResolved(val: any) {
    this.defaultReturn = val;
    this.isResolved = true;
  }
  setImplementation(fn: any) {
    this.impl = fn;
  }
  clear() {
    this.calls = [];
  }
  getDefaultReturn() {
    return this.defaultReturn;
  }
}

export interface AtomicMock extends Function {
  (...args: any[]): any;
  _handler: UniversalMockHandler;
  // Jest compatible
  mockReturnValue(v: any): void;
  mockResolvedValue(v: any): void;
  mockImplementation(fn: any): void;
  // Math dialect
  yields(v: any): void;
  mapsTo(v: any): void;
  convergesTo(v: any): void;
  derive(fn: any): void;
  // Narrative dialect
  respondsWith(v: any): void;
  eventuallyGives(v: any): void;
  actsLike(fn: any): void;
  // Imperative dialect
  forceReturn(v: any): void;
  resolveWith(v: any): void;
  executes(fn: any): void;
  // Shared
  clear(): void;
  reset(): void;
  // Support for arbitrary method mocks (Deep Proxy)
  [key: string]: any;
}

// A função mágica que é ao mesmo tempo executável e configurável
function createAtomicMock(
  implementation?: (...args: any[]) => any,
  parentHandler?: UniversalMockHandler,
): AtomicMock {
  const handler = new UniversalMockHandler(implementation);
  if (parentHandler) handler.setParent(parentHandler);
  const subMocks = new Map<string, any>();

  const mockFn = (...args: any[]) => handler.invoke(...args);

  // Mapeamento de TODOS os métodos de configuração de mocks
  const config: Record<string, any> = {
    _handler: handler,
    // Jest
    mockReturnValue: (v: any) => handler.setReturn(v),
    mockResolvedValue: (v: any) => handler.setResolved(v),
    mockImplementation: (fn: any) => handler.setImplementation(fn),

    // Matemático
    yields: (v: any) => handler.setReturn(v),
    mapsTo: (v: any) => handler.setReturn(v),
    convergesTo: (v: any) => handler.setResolved(v),
    derive: (fn: any) => handler.setImplementation(fn),

    // Narrativo
    respondsWith: (v: any) => handler.setReturn(v),
    eventuallyGives: (v: any) => handler.setResolved(v),
    actsLike: (fn: any) => handler.setImplementation(fn),

    // Imperativo
    forceReturn: (v: any) => handler.setReturn(v),
    resolveWith: (v: any) => handler.setResolved(v),
    executes: (fn: any) => handler.setImplementation(fn),

    // Common
    clear: () => {
      handler.clear();
      subMocks.forEach((m) => m.clear());
    },
    reset: () => {
      handler.clear();
      handler.setImplementation(null);
      handler.setReturn(undefined);
      subMocks.clear();
    },
  };

  // Retornamos um Proxy para permitir acesso a propriedades arbitrárias (como métodos)
  return new Proxy(mockFn, {
    get(target, prop: string) {
      // 1. Se for um método de configuração ou propriedade interna, retorna do config
      if (prop in config) return config[prop];
      if (prop === "then") return undefined; // Evita problemas com Promises

      // 2. Se o mock foi configurado para retornar um objeto, tentamos pegar a propriedade dele
      const currentReturn = handler.getDefaultReturn();
      if (
        currentReturn &&
        typeof currentReturn === "object" &&
        prop in currentReturn
      ) {
        return currentReturn[prop];
      }

      // 3. Se for uma propriedade arbitrária e não temos valor, retornamos um sub-mock (lazy creation)
      if (!subMocks.has(prop)) {
        subMocks.set(prop, createAtomicMock(undefined, handler));
      }
      return subMocks.get(prop);
    },
    // Permite Object.assign e outras operações
    set(target, prop: string, value: any) {
      config[prop] = value;
      return true;
    },
  }) as unknown as AtomicMock;
}

function createAtomicSpy(obj: any, method: string) {
  const original = obj[method];
  const mock = createAtomicMock(original);
  obj[method] = mock;
  return mock; // Retorna o mock para asserções
}

// ============================================================================
// 3. UNIVERSAL ASSERTION (O Juiz)
// ============================================================================

class UniversalAssertion<T> {
  constructor(
    private actual: T,
    private isNegated: boolean = false,
  ) {}

  get not() {
    return new UniversalAssertion(this.actual, !this.isNegated);
  }

  private pass(condition: boolean, msg: string) {
    const success = this.isNegated ? !condition : condition;
    if (!success) throw new Error(this.isNegated ? `[NOT] ${msg}` : msg);
  }

  // --- Equality & Truthiness ---

  // Jest / Classic
  toBe(expected: T) {
    this.pass(
      this.actual === expected,
      `Expected ${this.actual} to be ${expected}`,
    );
  }
  toEqual(expected: T) {
    this.pass(
      JSON.stringify(this.actual) === JSON.stringify(expected),
      `Expected ${this.actual} to equal ${expected}`,
    );
  }

  // Matemático
  is(expected: T) {
    this.toBe(expected);
  }

  // Narrativo
  be(expected: T) {
    this.toBe(expected);
  }

  // Imperativo
  isOk() {
    this.pass(!!this.actual, `Ensure ${this.actual} is truthy`);
  }
  matches(regex: RegExp) {
    if (typeof this.actual !== "string")
      throw new Error("Value must be string");
    this.pass(
      regex.test(this.actual),
      `Ensure '${this.actual}' matches ${regex}`,
    );
  }

  // Narrativo
  have(prop: string) {
    this.pass(
      typeof this.actual === "object" &&
        this.actual !== null &&
        prop in (this.actual as any),
      `Intend object to have '${prop}'`,
    );
  }
  uploaded(...args: any[]) {
    this.received(...args);
  }

  // --- Mock Assertions ---

  // Helper para pegar o handler do mock
  private getMockHandler(mockFn: any) {
    if (!mockFn._handler)
      throw new Error(
        "Assertion target is not a registered Mock/Spy function.",
      );
    return mockFn._handler as UniversalMockHandler;
  }

  // Jest
  toHaveBeenCalled() {
    const h = this.getMockHandler(this.actual);
    this.pass(h.calls.length > 0, "Expected mock to have been called");
  }
  toHaveBeenCalledWith(...args: any[]) {
    const h = this.getMockHandler(this.actual);
    const match = h.calls.some(
      (call) => JSON.stringify(call) === JSON.stringify(args),
    );
    this.pass(match, `Expected mock called with ${JSON.stringify(args)}`);
  }
  toHaveBeenCalledTimes(n: number) {
    const h = this.getMockHandler(this.actual);
    this.pass(
      h.calls.length === n,
      `Expected mock called ${n} times, got ${h.calls.length}`,
    );
  }

  // Matemático
  wasEvaluated() {
    this.toHaveBeenCalled();
  }
  appliedTo(...args: any[]) {
    this.toHaveBeenCalledWith(...args);
  }
  get evaluated() {
    const h = this.getMockHandler(this.actual);
    return (n: number) => ({ times: this.toHaveBeenCalledTimes(n) }); // Currying simulado para sintaxe .evaluated(n).times
  }

  // Narrativo
  wasCalled() {
    this.toHaveBeenCalled();
  }
  received(...args: any[]) {
    this.toHaveBeenCalledWith(...args);
  }
  get called() {
    const h = this.getMockHandler(this.actual);
    return (n: number) => ({ times: this.toHaveBeenCalledTimes(n) });
  }

  // Imperativo
  triggered() {
    this.toHaveBeenCalled();
  }
  calledWith(...args: any[]) {
    this.toHaveBeenCalledWith(...args);
  }
  triggeredCount(n: number) {
    this.toHaveBeenCalledTimes(n);
  }
}

// Factory para assertions
const assertValue = <T>(val: T) => new UniversalAssertion(val);

// ============================================================================
// 4. DIALECT EXPORTS (A Pedra de Roseta)
// ============================================================================

// --- 📐 MATEMÁTICO (MathDialect) ---
export const MathDialect = {
  // Structure
  axiom: (n: string, f: VoidFn) => core.defineGroup(n, f),
  proof: (n: string, f: VoidFn) => core.defineCase(n, f),
  implies: assertValue,

  // Mocks (Creation)
  arbitrary: createAtomicMock,
  lambda: createAtomicMock,
  monitor: createAtomicSpy,

  // Lifecycle
  postulate: (f: VoidFn) => core.addHook("beforeAll", f),
  conclude: (f: VoidFn) => core.addHook("afterAll", f),
  given: (f: VoidFn) => core.addHook("beforeEach", f),
};

// --- 📖 NARRATIVO (NarrativeDialect) ---
export const NarrativeDialect = {
  // Structure
  intend: (n: string, f: VoidFn) => core.defineGroup(n, f),
  story: (n: string, f: VoidFn) => core.defineGroup(n, f),
  detail: (n: string, f: VoidFn) => core.defineCase(n, f),
  scenario: (n: string, f: VoidFn) => core.defineCase(n, f),
  to: assertValue,

  // Mocks (Creation)
  dummy: createAtomicMock,
  standIn: createAtomicMock,
  watch: createAtomicSpy,
  shadow: createAtomicSpy,

  // Lifecycle
  background: (f: VoidFn) => core.addHook("beforeAll", f),
  cleanup: (f: VoidFn) => core.addHook("afterAll", f),
  before: (f: VoidFn) => core.addHook("beforeEach", f),
};

// --- 🛡️ IMPERATIVO (ImperativeDialect) ---
export const ImperativeDialect = {
  // Structure
  ensure: (n: string, f: VoidFn) => core.defineGroup(n, f),
  suite: (n: string, f: VoidFn) => core.defineGroup(n, f),
  check: (n: string, f: VoidFn) => core.defineCase(n, f),
  verify: (n: string, f: VoidFn) => core.defineCase(n, f),
  that: assertValue,

  // Mocks (Creation)
  stub: createAtomicMock,
  mock: createAtomicMock,
  inspect: createAtomicSpy,
  spy: createAtomicSpy,

  // Lifecycle
  initAll: (f: VoidFn) => core.addHook("beforeAll", f),
  disposeAll: (f: VoidFn) => core.addHook("afterAll", f),
  reset: (f: VoidFn) => core.addHook("beforeEach", f),
  clear: () => {}, // No-op for global clear
};

// --- 🤡 JEST / CLASSIC ---
export const ClassicDialect = {
  describe: (n: string, f: VoidFn) => core.defineGroup(n, f),
  it: (n: string, f: VoidFn) => core.defineCase(n, f),
  test: (n: string, f: VoidFn) => core.defineCase(n, f),
  expect: assertValue,

  // Objeto Jest Global (simulado)
  jest: {
    fn: createAtomicMock,
    spyOn: createAtomicSpy,
  },

  beforeAll: (f: VoidFn) => core.addHook("beforeAll", f),
  afterAll: (f: VoidFn) => core.addHook("afterAll", f),
  beforeEach: (f: VoidFn) => core.addHook("beforeEach", f),
  afterEach: (f: VoidFn) => core.addHook("afterEach", f),
};

// --- Top-Level Exports for Ease of Use ---
export const {
  axiom,
  proof,
  implies,
  arbitrary,
  lambda,
  monitor,
  postulate,
  conclude,
  given,
} = MathDialect;
export const {
  intend,
  story,
  detail,
  scenario,
  to,
  dummy,
  standIn,
  watch,
  shadow,
  background,
  cleanup,
  before,
} = NarrativeDialect;
export const {
  ensure,
  suite,
  check,
  verify,
  that,
  stub,
  mock,
  inspect,
  spy,
  initAll,
  disposeAll,
  reset,
  clear,
} = ImperativeDialect;
export const {
  describe,
  it,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} = ClassicDialect;
