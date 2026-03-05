# 📖 Dialeto Narrativo - API Completa

> **Filosofia:** BDD (Behavior Driven Development) e Storytelling.
>
> **Vibe:** Fluida, Humana, Descritiva.
>
> **Ideal para:** Designers, Product Managers, times ágeis, testes de fluxos de usuário (User Journeys).

## Estrutura

| Função               | Descrição                           | Equivalente Jest |
| -------------------- | ----------------------------------- | ---------------- |
| `intend(name, fn)`   | Define a intenção do bloco          | `describe`       |
| `story(name, fn)`    | Alias para agrupamento de histórias | `describe`       |
| `detail(name, fn)`   | Detalha um comportamento específico | `test` / `it`    |
| `scenario(name, fn)` | Um cenário de uso                   | `test` / `it`    |

## Asserções

| Função                    | Descrição                      | Equivalente Jest                         |
| ------------------------- | ------------------------------ | ---------------------------------------- |
| `to(val).be(expected)`    | "Para o valor ser..."          | `expect(val).toBe(expected)`             |
| `to(val).have(prop)`      | Verifica posse de propriedade  | `expect(val).toHaveProperty(prop)`       |
| `to(val).wasCalled()`     | Verifica se o ator foi chamado | `expect(val).toHaveBeenCalled()`         |
| `to(val).received(args)`  | Verifica o que foi recebido    | `expect(val).toHaveBeenCalledWith(args)` |
| `to(val).called(n).times` | Contagem de chamadas           | `expect(val).toHaveBeenCalledTimes(n)`   |

## Mocks (Dublês/Atores)

| Função                       | Descrição                        | Equivalente Jest          |
| ---------------------------- | -------------------------------- | ------------------------- |
| `dummy()`                    | Um dublê (ator) no lugar do real | `jest.fn()`               |
| `standIn()`                  | Alias para dummy                 | `jest.fn()`               |
| `watch(obj, method)`         | Observa um ator existente        | `jest.spyOn(obj, method)` |
| `shadow(obj, method)`        | Segue (shadows) um método        | `jest.spyOn(obj, method)` |
| `actor.respondsWith(val)`    | Define a resposta do ator        | `mockReturnValue(val)`    |
| `actor.eventuallyGives(val)` | Resposta futura (promessa)       | `mockResolvedValue(val)`  |
| `actor.actsLike(fn)`         | Define como o ator deve agir     | `mockImplementation(fn)`  |

## Lifecycle

| Função           | Descrição                     | Equivalente Jest |
| ---------------- | ----------------------------- | ---------------- |
| `background(fn)` | Contexto de fundo da história | `beforeAll(fn)`  |
| `before(fn)`     | Antes de cada cena            | `beforeEach(fn)` |
| `cleanup(fn)`    | Limpeza após a história       | `afterAll(fn)`   |

## Exemplo Completo

```javascript
import {
  intend,
  story,
  scenario,
  detail,
  to,
  standIn,
  dummy,
  watch,
  background,
  before,
  cleanup,
} from "@vibe2founder/tests2dialects";

intend("Fluxo de Autenticação do Usuário", () => {
  const authService = standIn();
  const database = standIn();
  const emailSender = dummy();

  background(() => {
    // Configura o cenário de fundo para toda a história
    authService.respondsWith({ token: "abc-123", expiresIn: 3600 });
    database.respondsWith(true);
    emailSender.respondsWith({ sent: true });
  });

  before(() => {
    // Reset de estado antes de cada cena
  });

  scenario("Login com credenciais válidas deve retornar token", () => {
    const response = authService.login("usuario", "senha_secreta");

    to(response).have("token");
    to(response.token).be("abc-123");
    to(response).have("expiresIn");
  });

  scenario("Login deve registrar tentativa no banco de dados", () => {
    authService.login("usuario", "senha_secreta");
    database.logAttempt("usuario", "success");

    to(database).wasCalled();
    to(database).received("logAttempt", "usuario", "success");
  });

  scenario("Login bem-sucedido envia email de boas-vindas", () => {
    authService.login("novo_usuario", "senha123");
    emailSender.send("novo_usuario@email.com", "Bem-vindo!");

    to(emailSender).wasCalled();
  });

  cleanup(() => {
    console.log("Histórias de autenticação concluídas.");
  });
});

story("Jornada de Compra do Usuário", () => {
  const cart = standIn();
  const user = standIn();
  const paymentGateway = standIn();

  background(() => {
    cart.respondsWith({ items: [], total: 0 });
    user.respondsWith({ name: "João", loggedIn: true });
    paymentGateway.respondsWith({ status: "approved" });
  });

  scenario("Usuário adiciona primeiro produto ao carrinho", () => {
    cart.add({ name: "Camiseta", price: 49.9, quantity: 1 });
    cart.respondsWith({
      items: [{ name: "Camiseta", price: 49.9, quantity: 1 }],
      total: 49.9,
    });

    to(cart).wasCalled();
    to(cart.items).have("length");
  });

  scenario("Usuário aplica cupom de desconto", () => {
    const coupon = standIn();
    coupon.respondsWith({ valid: true, discount: 15 });

    cart.applyCoupon("DESCONTO15");
    cart.respondsWith({ total: 42.42 }); // 49.9 - 15%

    to(coupon).wasCalled();
    to(cart.total).be(42.42);
  });

  detail("Carrinho vazio mostra mensagem amigável", () => {
    cart.respondsWith({
      items: [],
      total: 0,
      message: "Seu carrinho está vazio",
    });

    to(cart.message).be("Seu carrinho está vazio");
  });

  scenario("Usuário não logado tenta finalizar compra", () => {
    user.respondsWith({ loggedIn: false });
    const checkout = standIn();
    checkout.respondsWith({ error: "LOGIN_REQUIRED", status: 401 });

    to(checkout.status).be(401);
    to(checkout.error).be("LOGIN_REQUIRED");
  });

  scenario("Pagamento aprovado finaliza a compra", () => {
    cart.checkout();

    to(paymentGateway.status).be("approved");
    to(cart).wasCalled();
  });
});
```

## Quando Usar

- ✅ Fluxos de usuário (User Journeys)
- ✅ Testes E2E legíveis
- ✅ Documentação viva para PMs
- ✅ Regras de negócio de alto nível
- ✅ Testes de aceitação

## Quando NÃO Usar

- ❌ Algoritmos matemáticos puros → Use o [Dialeto Matemático](./api-matematico.md)
- ❌ Integrações técnicas com contratos rígidos → Use o [Dialeto Imperativo](./api-imperativo.md)
