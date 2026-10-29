# Estuda com a Nazza

"Duolingo" de questões do concurso **UFRJ – Assistente em Administração**, só pro Arthur, usado no celular como app instalado (PWA). Mascote: a Nazzareh.

- **No ar:** https://arthurboente981.github.io/nazza-estudos/ (repo público `ArthurBoente981/nazza-estudos`)
- **Publicar = `git push` na main.** O GitHub Actions (`.github/workflows/publicar.yml`) faz o build e publica em ~1 min. O app instalado atualiza sozinho na próxima abertura (às vezes na segunda). A data/hora do build aparece no rodapé dos Ajustes.
- Commits deste repo usam o e-mail noreply do GitHub (já configurado no `git config` local). Nunca o Gmail.

## Rodar e testar

- `npx vite --host 0.0.0.0 --port 5180`: dev, abre no celular pela rede em `http://<ip do PC>:5180`
- `npx vite build && npx vite preview --port 5181`: versão final em `http://localhost:5181/nazza-estudos/` (com service worker; pra testar versão nova no mesmo navegador, desregistrar o SW e limpar o cache antes)
- `npx eslint src`

## Estrutura

| Arquivo | O quê |
|---|---|
| `src/trilha.js` | Roadmap do edital (seções → unidades com `id` e nº de lições previstas) e categorias. Lições entram sozinhas pelo `unidadeId` + `ordem` do JSON |
| `src/conteudo/*.json` | Uma lição por arquivo (`<unidadeId>-<ordem>.json`), 12 questões |
| `src/Licao.jsx` | Motor da lição: tipos mc, ce, lacuna, pares; erradas voltam pro fim |
| `src/telas/` | Trilha, Praticar (categoria/matéria/erros), Perfil, Ajustes |
| `src/Nazza.jsx` | Nazzareh animada (emotes em `public/nazza/*.webp`, vídeos `acenando`/`paz`), ícones (só os importados na lista) e confete |
| `src/estado.js` | Progresso no localStorage: XP, ofensiva, histórico por id de questão, config |
| `src/instalar.js`, `BotaoInstalar.jsx` | Botão "Instalar app" com instruções por navegador |

Ícone novo do lucide-react: acrescentar no import e no objeto `Icones` de `src/Nazza.jsx`.

## Conteúdo (o trabalho principal daqui pra frente)

1. **Regras de escrita:** `GUIA-CONTEUDO.md` (formato, ids, tipos, categorias, exatidão).
2. **Ids das questões são permanentes** (`<unidadeId>-<ordem>-NN`). O histórico do Arthur depende deles: nunca renumerar nem reaproveitar.
3. **Unidade nova:** acrescentar em `roteiro` no `src/trilha.js` e na lista `UNIDADES` de `scripts/validar.mjs`.
4. **Fluxo que funcionou na Seção 1 (29/10/2026):**
   - um subagente Sonnet (general-purpose) por bloco de lições, em paralelo, seguindo o guia;
   - `node scripts/validar.mjs` até 0 erros;
   - agente `revisor` por bloco, conferindo contra o **texto integral** das leis em `leis/*.txt` (fora do git);
   - correções com `node scripts/corrigir.mjs correcoes.json` (`{ "<id>": { "<campo>": valor } }`); `dica` é campo da lição, editar à parte.
5. **Textos das leis:** o Planalto bloqueia `curl` e o WebFetch só devolve resumo. Pra baixar/atualizar a íntegra: rodar `python3 -I scripts/receptor-leis.py` em segundo plano e, pelo Playwright, abrir cada página do Planalto, pegar `document.body.innerText` (marcando `<strike>` como `[[REVOGADO: …]]`) e mandar por POST pra `http://127.0.0.1:8765/<nome>`. Os textos de `leis/` são de 29/10/2026.

## Pendências

- Decidir com o Arthur: trilha bloqueia em sequência (hoje) × botão "pular pra unidade" com teste.
- Revisão do dia com repetição espaçada (FSRS) usando `estado.historico`.
- Seção 2 (Conhecimentos Gerais), 3 (Informática) e 4 (Específicos) do edital (`~/Documentos/Obsidian Vault/Estudos/Matérias.md`).
- Arquivos sobrando do template do Vite (`src/App.css`, `src/assets/`, `public/vite.svg`): não usados; só apagar com o OK do Arthur.
