// Aplica correções em questões pelo id, sem mexer no resto do arquivo.
// Uso: node scripts/corrigir.mjs correcoes.json
// correcoes.json = { "<id da questão>": { "<campo>": <valor novo>, ... }, ... }
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const PASTA = new URL('../src/conteudo/', import.meta.url)
const correcoes = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const pendentes = new Set(Object.keys(correcoes))

for (const arq of readdirSync(PASTA).filter((f) => f.endsWith('.json'))) {
  const url = new URL(arq, PASTA)
  const licao = JSON.parse(readFileSync(url, 'utf8'))
  let mudou = false
  for (const q of licao.questoes) {
    if (!correcoes[q.id]) continue
    for (const [campo, valor] of Object.entries(correcoes[q.id])) {
      if (campo === 'id') throw new Error(`Não se muda o id (${q.id})`)
      q[campo] = valor
    }
    pendentes.delete(q.id)
    mudou = true
    console.log(`✔ ${q.id}: ${Object.keys(correcoes[q.id]).join(', ')}`)
  }
  if (mudou) writeFileSync(url, JSON.stringify(licao, null, 2) + '\n')
}

for (const id of pendentes) console.log(`❌ id não encontrado: ${id}`)
process.exit(pendentes.size ? 1 : 0)
