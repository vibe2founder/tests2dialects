# 🛡️ Dialeto Imperativo - API Completa

> **Filosofia:** Design by Contract e Engenharia de Sistemas.
>
> **Vibe:** Técnica, Rigorosa, "Crachá de Engenheiro".
>
> **Ideal para:** Engenheiros de backend, DevOps, validação de APIs, conformidade (compliance).

## Estrutura

| Função             | Descrição                       | Equivalente Jest |
| ------------------ | ------------------------------- | ---------------- |
| `ensure(name, fn)` | Garante um requisito de sistema | `describe`       |
| `suite(name, fn)`  | Uma suite de verificações       | `describe`       |
| `check(name, fn)`  | Uma checagem pontual            | `test` / `it`    |
| `verify(name, fn)` | Verificação de conformidade     | `test` / `it`    |

## Asserções

| Função                        | Descrição             | Equivalente Jest                         |
| ----------------------------- | --------------------- | ---------------------------------------- |
| `that(val).is(expected)`      | "Que o valor é..."    | `expect(val).toBe(expected)`             |
| `that(val).isOk()`            | Verifica "truthiness" | `expect(val).toBeTruthy()`               |
| `that(val).matches(regex)`    | Validação de padrão   | `expect(val).toMatch(regex)`             |
| `that(val).triggered()`       | Verifica disparo      | `expect(val).toHaveBeenCalled()`         |
| `that(val).calledWith(args)`  | Verifica payload      | `expect(val).toHaveBeenCalledWith(args)` |
| `that(val).triggeredCount(n)` | Contagem exata        | `expect(val).toHaveBeenCalledTimes(n)`   |

## Mocks

| Função                 | Descrição                        | Equivalente Jest          |
| ---------------------- | -------------------------------- | ------------------------- |
| `stub()`               | Cria um stub de infraestrutura   | `jest.fn()`               |
| `mock()`               | Alias para stub                  | `jest.fn()`               |
| `inspect(obj, method)` | Inspeciona um método interno     | `jest.spyOn(obj, method)` |
| `spy(obj, method)`     | Alias clássico                   | `jest.spyOn(obj, method)` |
| `s.forceReturn(val)`   | Força um retorno imediato        | `mockReturnValue(val)`    |
| `s.resolveWith(val)`   | Resolve promessa (network)       | `mockResolvedValue(val)`  |
| `s.executes(fn)`       | Executa implementação substituta | `mockImplementation(fn)`  |

## Lifecycle

| Função           | Descrição                       | Equivalente Jest |
| ---------------- | ------------------------------- | ---------------- |
| `initAll(fn)`    | Inicialização de sistema        | `beforeAll(fn)`  |
| `reset(fn)`      | Reset de estado (antes de cada) | `beforeEach(fn)` |
| `disposeAll(fn)` | Descarte de recursos            | `afterAll(fn)`   |

## Exemplo Completo

```javascript
import {
  ensure,
  check,
  verify,
  that,
  stub,
  initAll,
  reset,
} from "@vibe2founder/tests2dialects";

ensure("Conformidade do Gateway de Pagamento", () => {
  let apiGateway;
  let transactionLogger;

  initAll(() => {
    apiGateway = stub();
    transactionLogger = stub();

    apiGateway.forceReturn({
      status: 200,
      transactionId: "tx_abc123",
      timestamp: "2026-01-01T00:00:00Z",
    });
    transactionLogger.forceReturn(true);
  });

  reset(() => {
    // Limpa estado entre testes se necessário
  });

  check("Transação bem-sucedida retorna status 200", () => {
    const response = apiGateway.process({
      amount: 99.9,
      currency: "BRL",
      cardToken: "tok_visa_xxxx",
    });

    that(response.status).is(200);
    that(response.transactionId).matches(/^tx_[a-z0-9]+$/);
  });

  verify("TransactionId segue padrão RFC do contrato", () => {
    const response = apiGateway.process({ amount: 50 });

    that(response.transactionId).matches(/^tx_[a-z0-9]{6,}$/);
    that(response.timestamp).matches(/^\d{4}-\d{2}-\d{2}T/);
  });

  check("Toda transação deve ser logada para auditoria", () => {
    apiGateway.process({ amount: 100 });
    transactionLogger.log({ event: "PAYMENT_PROCESSED" });

    that(transactionLogger).triggered();
    that(transactionLogger).calledWith({ event: "PAYMENT_PROCESSED" });
  });

  verify("Gateway deve ser acionado exatamente uma vez por request", () => {
    that(apiGateway).triggeredCount(1);
  });
});
```

## Quando Usar

- ✅ Integrações de API
- ✅ Drivers de banco de dados
- ✅ Validação de contratos RFC
- ✅ Conformidade com regulamentos (PCI-DSS, LGPD, etc.)
- ✅ Testes de infraestrutura

## Quando NÃO Usar

- ❌ Algoritmos matemáticos puros → Use o [Dialeto Matemático](./api-matematico.md)
- ❌ Fluxos de usuário legíveis por PMs → Use o [Dialeto Narrativo](./api-narrativo.md)
