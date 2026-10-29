import provimento1 from './conteudo/8112-provimento.json'
import provimento2 from './conteudo/8112-formas-provimento.json'

// O id de cada questão vem fixo do JSON (o histórico de acertos depende dele,
// então nunca reaproveitar nem renumerar). Cada questão herda fonte/matéria da lição.
const idsVistos = new Set()
function prepara(licao) {
  for (const q of licao.questoes) {
    if (!q.id || idsVistos.has(q.id)) console.error(`Questão sem id ou com id repetido em ${licao.id}:`, q.id)
    idsVistos.add(q.id)
  }
  return { ...licao, questoes: licao.questoes.map((q) => ({ ...q, fonte: licao.fonte, materia: licao.materia })) }
}

export const categorias = {
  prazos: { nome: 'Prazos e números', icone: 'Timer', cor: 'azul' },
  pegadinhas: { nome: 'Pegadinhas de banca', icone: 'Bomb', cor: 'rosa' },
  conceitos: { nome: 'Conceitos', icone: 'BookOpen', cor: 'roxo' },
  regras: { nome: 'Regras e requisitos', icone: 'Scale', cor: 'verde' },
  formas: { nome: 'Formas de provimento', icone: 'Repeat', cor: 'ouro' },
}

// Seção 1 do edital (Conhecimentos de Administração Pública).
// null = lição ainda sem conteúdo (aparece trancada pra mostrar o roadmap).
export const secoes = [
  {
    titulo: 'Administração Pública',
    unidades: [
      { nome: 'Lei 8.112: Provimento', cor: 'roxo', licoes: [prepara(provimento1), prepara(provimento2), null] },
      { nome: 'Lei 8.112: Vacância e movimentação', cor: 'azul', licoes: [null, null, null] },
      { nome: 'Lei 8.112: Vantagens e licenças', cor: 'verde', licoes: [null, null, null] },
      { nome: 'Lei 8.112: Regime disciplinar', cor: 'rosa', licoes: [null, null, null] },
      { nome: 'Princípios constitucionais', cor: 'ouro', licoes: [null, null] },
      { nome: 'Ética (Decreto 1.171)', cor: 'roxo', licoes: [null, null] },
      { nome: 'Carreira TAE (Lei 11.091)', cor: 'azul', licoes: [null, null] },
      { nome: 'Processo administrativo (Lei 9.784)', cor: 'verde', licoes: [null, null, null] },
      { nome: 'Organização administrativa', cor: 'rosa', licoes: [null, null] },
      { nome: 'Improbidade (Lei 8.429)', cor: 'ouro', licoes: [null, null] },
      { nome: 'Gestão orçamentária (AFO)', cor: 'roxo', licoes: [null, null, null] },
    ],
  },
]

export const todasLicoes = secoes.flatMap((s) => s.unidades.flatMap((u) => u.licoes.filter(Boolean)))
export const todasQuestoes = todasLicoes.flatMap((l) => l.questoes)
export const materias = [...new Set(todasQuestoes.map((q) => q.materia))]
