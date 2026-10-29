# Guia de conteúdo: como escrever uma lição

O app é um "Duolingo" de questões do concurso **UFRJ – Assistente em Administração** (banca própria da UFRJ/PR-4, múltipla escolha A–E). Quem estuda é o Arthur, no celular, em sessões curtas. A mascote é a **Nazzareh** (fala informal, carinhosa, carioca).

Cada lição é um arquivo `src/conteudo/<unidadeId>-<ordem>.json`. Modelos prontos: `src/conteudo/8112-provimento-1.json` e `8112-provimento-2.json`. **Leia os dois antes de escrever.**

Depois de escrever, rode `node scripts/validar.mjs` e corrija até dar 0 erros.

---

## Formato

```json
{
  "id": "9784-1",
  "unidadeId": "9784",
  "ordem": 1,
  "titulo": "Princípios e direitos do administrado",
  "materia": "Lei 9.784/99",
  "fonte": "Lei 9.784",
  "dica": "Resumo de 2–4 frases com o essencial da lição e, se houver, um mnemônico em MAIÚSCULAS.",
  "questoes": [ ... 12 questões ... ]
}
```

- `id` da lição = `<unidadeId>-<ordem>`.
- `materia` é o nome que aparece no filtro "Por matéria" (use sempre o mesmo texto pra mesma lei).
- `fonte` aparece antes do artigo no feedback: "📜 Lei 9.784 · Art. 3º".

## Ids das questões (IMPORTANTE)

`<unidadeId>-<ordem>-<NN>` → `9784-1-01`, `9784-1-02`… Precisa ser único no app inteiro. O histórico de acertos do usuário depende do id, então ele nunca muda depois de publicado.
(As duas lições antigas usam `8112-posse-NN` e `8112-formas-NN`; não mexer nelas.)

## Os 4 tipos de questão

**mc**: múltipla escolha, sempre 5 opções, `correta` = índice 0–4 (o app embaralha). Distratores plausíveis, do mesmo tamanho aproximado da certa e tirados de confusões reais (prazo vizinho, instituto parecido, autoridade errada). Nada de "todas as anteriores".
```json
{ "id": "...", "tipo": "mc", "categoria": "prazos", "enunciado": "...", "opcoes": ["a","b","c","d","e"], "correta": 1, "explicacao": "...", "artigo": "Art. 13, § 1º" }
```

**ce**: certo ou errado, `correta` true/false. Afirmação única e clara, no estilo de banca. Equilibre: ~metade falsas.
```json
{ "id": "...", "tipo": "ce", "categoria": "pegadinhas", "enunciado": "...", "correta": false, "explicacao": "...", "artigo": "..." }
```

**lacuna**: completar o texto da lei. Exatamente um `___` no `texto`; `banco` com 4 palavras curtas (1–3 palavras cada), uma delas a `correta`. Use o texto literal da lei sempre que der.
```json
{ "id": "...", "tipo": "lacuna", "categoria": "prazos", "texto": "... ___ ...", "banco": ["15","30","10","60"], "correta": "15", "explicacao": "...", "artigo": "..." }
```

**pares**: ligar colunas, 3 a 5 pares. Esquerda curta (até ~28 caracteres), direita curta (até ~40), porque cabe numa tela de celular em 2 colunas.
```json
{ "id": "...", "tipo": "pares", "categoria": "tipos", "enunciado": "Ligue ...:", "pares": [["Termo","Definição curta"], ...], "explicacao": "...", "artigo": "..." }
```

**Mistura por lição (12 questões):** ~4 mc, ~4 ce, ~2–3 lacuna, 0–1 pares. Comece pela questão mais básica e termine pelas mais difíceis/pegadinhas.

## Categorias (campo `categoria`, obrigatório)

| id | Use quando a questão cobra… |
|---|---|
| `prazos` | prazos, idades, percentuais, quantidades, valores |
| `pegadinhas` | a troca clássica de banca (instituto parecido, "sempre/nunca", exceção que vira regra) |
| `conceitos` | definição, natureza jurídica, "o que é" |
| `regras` | requisitos, vedações, condições, procedimento |
| `tipos` | classificações, espécies, listas ("são formas de…", "NÃO é…") |
| `competencias` | quem decide/faz o quê: autoridade, órgão, comissão |

## Texto

- **Explicação**: 1–2 frases (até ~250 caracteres), dizendo POR QUE é assim. Quando for pegadinha, nomeie a troca ("Isso é RECONDUÇÃO, não reintegração"). Destaque a palavra-chave em MAIÚSCULAS, no máximo uma ou duas por explicação.
- **Artigo**: sempre o dispositivo exato ("Art. 24, § 1º", "Art. 37, caput, CF"). Sem artigo não entra.
- **Dica** da lição: 2–4 frases, tom da Nazzareh, com o "pulo do gato".
- Português correto, sem gíria nas questões (gíria só na dica, se couber).

## Exatidão (o mais importante)

- **Confira cada afirmação no texto oficial e atualizado da lei** no Planalto (planalto.gov.br/ccivil_03/…). As notas do cofre do Arthur ajudam a escolher o que cobrar, mas podem ter erro ou estar desatualizadas.
- Cuidado com alterações: Lei 8.429 foi muito alterada pela **Lei 14.230/2021** (dolo obrigatório, prazos, sanções); Lei 8.112 tem dispositivos revogados (transferência, ascensão); LRF e 9.784 também têm alterações.
- Onde lei e jurisprudência/Constituição divergem (ex.: estágio probatório de 24 meses na 8.112 × estabilidade de 3 anos na CF), **cobre o texto da lei e explique a divergência na explicação**, ou evite a questão.
- Na dúvida sobre um ponto, não faça a questão.
- Nada de questão copiada de prova real com texto idêntico; inspire-se no estilo.
