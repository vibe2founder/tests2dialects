# @vibe2founder/request2http

Implementação nativa e minimalista de requisições HTTP para o ecossistema @vibe2founder.

[Link para o CHANGELOG](../../CHANGELOG.md)

## Como foi feito
O `@vibe2founder/request2http` foi implementado como uma abstração leve sobre a Fetch API disponível nativamente no Bun e Node.js moderno. 

**Decisões Técnicas:**
- Uso de `fetch` nativo para evitar inflar o `node_modules`.
- Tipagem NOMINAL para garantir que métodos HTTP e URLs sejam tratados com rigor semântico.
- Tratamento automático de JSON para simplificar o consumo de APIs REST.

## Como funciona
A função principal `request2http` aceita uma URL e um objeto de opções (method, headers, body) e retorna uma Promise com o status, dados e headers da resposta.

```typescript
const response = await request2http("https://api.exemplo.com/users", {
  method: "POST",
  body: { name: "Test" }
});
```

## Como testar
Pode ser testado indiretamente através do dialeto de API:
```bash
wsl bun run examples/test-api.ts
```

## Fontes de Informação
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Nominal Typing in TypeScript](https://basarat.gitbook.io/typescript/main-1/nominaltyping)
