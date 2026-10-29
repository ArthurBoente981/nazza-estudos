// Confere todas as lições de src/conteudo: formato, ids únicos, gabaritos e tamanhos.
// Uso: node scripts/validar.mjs   (sai com código 1 se achar erro)
import { readdirSync, readFileSync } from 'node:fs'

const PASTA = new URL('../src/conteudo/', import.meta.url)
const CATEGORIAS = ['prazos', 'pegadinhas', 'conceitos', 'regras', 'tipos', 'competencias']
const UNIDADES = ['8112-provimento', '8112-vacancia', '8112-direitos', '8112-disciplinar', 'principios', 'etica', 'tae', 'comunicacao', '9784', 'organizacao', 'improbidade', 'afo']

const erros = []
const avisos = []
const idsQuestoes = new Set()
const idsLicoes = new Set()
const ordens = new Set()
let total = 0

for (const arq of readdirSync(PASTA).filter((f) => f.endsWith('.json')).sort()) {
  const onde = (q) => `${arq}${q ? ` [${q.id ?? '?'}]` : ''}`
  let l
  try {
    l = JSON.parse(readFileSync(new URL(arq, PASTA), 'utf8'))
  } catch (e) {
    erros.push(`${arq}: JSON inválido (${e.message})`)
    continue
  }
  for (const campo of ['id', 'unidadeId', 'ordem', 'titulo', 'materia', 'fonte', 'dica', 'questoes'])
    if (l[campo] === undefined) erros.push(`${onde()}: falta "${campo}"`)
  if (!UNIDADES.includes(l.unidadeId)) erros.push(`${onde()}: unidadeId desconhecido "${l.unidadeId}"`)
  if (idsLicoes.has(l.id)) erros.push(`${onde()}: id de lição repetido "${l.id}"`)
  idsLicoes.add(l.id)
  if (ordens.has(`${l.unidadeId}#${l.ordem}`)) erros.push(`${onde()}: ordem ${l.ordem} repetida na unidade ${l.unidadeId}`)
  ordens.add(`${l.unidadeId}#${l.ordem}`)
  if (l.dica && l.dica.length > 400) avisos.push(`${onde()}: dica longa (${l.dica.length} caracteres)`)
  if (!Array.isArray(l.questoes)) continue
  if (l.questoes.length < 10 || l.questoes.length > 14) avisos.push(`${onde()}: ${l.questoes.length} questões (o padrão é 12)`)

  const tipos = new Set()
  for (const q of l.questoes) {
    total++
    tipos.add(q.tipo)
    if (!q.id) erros.push(`${onde(q)}: questão sem id`)
    else if (idsQuestoes.has(q.id)) erros.push(`${onde(q)}: id de questão repetido`)
    idsQuestoes.add(q.id)
    if (!CATEGORIAS.includes(q.categoria)) erros.push(`${onde(q)}: categoria inválida "${q.categoria}"`)
    if (!q.explicacao) erros.push(`${onde(q)}: falta explicacao`)
    if (!q.artigo) erros.push(`${onde(q)}: falta artigo`)
    if (q.explicacao && q.explicacao.length > 320) avisos.push(`${onde(q)}: explicação longa (${q.explicacao.length})`)

    if (q.tipo === 'mc') {
      if (!q.enunciado) erros.push(`${onde(q)}: mc sem enunciado`)
      if (!Array.isArray(q.opcoes) || q.opcoes.length !== 5) erros.push(`${onde(q)}: mc precisa de 5 opções`)
      else if (new Set(q.opcoes).size !== 5) erros.push(`${onde(q)}: opções repetidas`)
      if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta > 4) erros.push(`${onde(q)}: correta deve ser 0–4`)
    } else if (q.tipo === 'ce') {
      if (!q.enunciado) erros.push(`${onde(q)}: ce sem enunciado`)
      if (typeof q.correta !== 'boolean') erros.push(`${onde(q)}: ce precisa de correta true/false`)
    } else if (q.tipo === 'lacuna') {
      if (!q.texto || q.texto.split('___').length !== 2) erros.push(`${onde(q)}: lacuna precisa de exatamente um ___ no texto`)
      if (!Array.isArray(q.banco) || q.banco.length !== 4) erros.push(`${onde(q)}: lacuna precisa de 4 palavras no banco`)
      else if (!q.banco.includes(q.correta)) erros.push(`${onde(q)}: resposta "${q.correta}" não está no banco`)
      else if (new Set(q.banco).size !== 4) erros.push(`${onde(q)}: banco com palavras repetidas`)
    } else if (q.tipo === 'pares') {
      if (!q.enunciado) erros.push(`${onde(q)}: pares sem enunciado`)
      if (!Array.isArray(q.pares) || q.pares.length < 3 || q.pares.length > 5) erros.push(`${onde(q)}: pares precisa de 3 a 5 pares`)
      else {
        const lados = q.pares.flat()
        if (new Set(lados).size !== lados.length) erros.push(`${onde(q)}: textos repetidos nos pares`)
        for (const [a, b] of q.pares) if (a.length > 28 || b.length > 40) avisos.push(`${onde(q)}: par longo demais pro celular ("${a}" / "${b}")`)
      }
    } else erros.push(`${onde(q)}: tipo desconhecido "${q.tipo}"`)
  }
  if (tipos.size < 3) avisos.push(`${onde()}: só ${tipos.size} tipo(s) de exercício (use pelo menos 3)`)
}

for (const a of avisos) console.log('⚠️ ', a)
for (const e of erros) console.log('❌', e)
console.log(`\n${idsLicoes.size} lições, ${total} questões, ${erros.length} erro(s), ${avisos.length} aviso(s)`)
process.exit(erros.length ? 1 : 0)
