// Todas as lições ficam em src/conteudo/*.json e entram sozinhas na trilha
// pelo `unidadeId` + `ordem` de cada arquivo (formato em GUIA-CONTEUDO.md).
const arquivos = import.meta.glob('./conteudo/*.json', { eager: true, import: 'default' })

export const categorias = {
  prazos: { nome: 'Prazos e números', icone: 'Timer', cor: 'azul' },
  pegadinhas: { nome: 'Pegadinhas de banca', icone: 'Bomb', cor: 'rosa' },
  conceitos: { nome: 'Conceitos', icone: 'BookOpen', cor: 'roxo' },
  regras: { nome: 'Regras e requisitos', icone: 'Scale', cor: 'verde' },
  tipos: { nome: 'Tipos e classificações', icone: 'Repeat', cor: 'ouro' },
  competencias: { nome: 'Quem faz o quê', icone: 'Users', cor: 'laranja' },
}

// Roadmap do edital. `licoes` = quantas lições a unidade terá (as que faltam aparecem trancadas).
const roteiro = [
  {
    titulo: 'Administração Pública',
    unidades: [
      { id: '8112-provimento', nome: 'Lei 8.112: Provimento', cor: 'roxo', licoes: 3 },
      { id: '8112-vacancia', nome: 'Lei 8.112: Vacância e movimentação', cor: 'azul', licoes: 3 },
      { id: '8112-direitos', nome: 'Lei 8.112: Direitos e vantagens', cor: 'verde', licoes: 3 },
      { id: '8112-disciplinar', nome: 'Lei 8.112: Regime disciplinar', cor: 'rosa', licoes: 3 },
      { id: 'principios', nome: 'Princípios constitucionais', cor: 'ouro', licoes: 2 },
      { id: 'etica', nome: 'Ética (Decreto 1.171)', cor: 'roxo', licoes: 2 },
      { id: 'tae', nome: 'Carreira TAE (Lei 11.091)', cor: 'azul', licoes: 2 },
      { id: 'comunicacao', nome: 'Comunicação oficial (Decreto 9.758)', cor: 'verde', licoes: 1 },
      { id: '9784', nome: 'Processo administrativo (Lei 9.784)', cor: 'rosa', licoes: 3 },
      { id: 'organizacao', nome: 'Organização administrativa', cor: 'ouro', licoes: 2 },
      { id: 'improbidade', nome: 'Improbidade (Lei 8.429)', cor: 'roxo', licoes: 2 },
      { id: 'afo', nome: 'Gestão orçamentária (AFO)', cor: 'azul', licoes: 3 },
    ],
  },
]

// O id de cada questão vem fixo do JSON (o histórico de acertos depende dele,
// então nunca reaproveitar nem renumerar). Cada questão herda fonte/matéria da lição.
const idsVistos = new Set()
function prepara(licao, unidade) {
  for (const q of licao.questoes) {
    if (!q.id || idsVistos.has(q.id)) console.error(`Questão sem id ou com id repetido em ${licao.id}:`, q.id)
    idsVistos.add(q.id)
  }
  return {
    ...licao,
    unidade: unidade.nome,
    questoes: licao.questoes.map((q) => ({ ...q, fonte: licao.fonte, materia: licao.materia })),
  }
}

const porUnidade = {}
for (const l of Object.values(arquivos)) (porUnidade[l.unidadeId] ||= []).push(l)

export const secoes = roteiro.map((s) => ({
  ...s,
  unidades: s.unidades.map((u) => {
    const prontas = (porUnidade[u.id] || []).sort((a, b) => a.ordem - b.ordem).map((l) => prepara(l, u))
    const total = Math.max(u.licoes, prontas.length)
    return { ...u, licoes: Array.from({ length: total }, (_, i) => prontas[i] || null) }
  }),
}))

export const todasLicoes = secoes.flatMap((s) => s.unidades.flatMap((u) => u.licoes.filter(Boolean)))
export const todasQuestoes = todasLicoes.flatMap((l) => l.questoes)
export const materias = [...new Set(todasQuestoes.map((q) => q.materia))]
