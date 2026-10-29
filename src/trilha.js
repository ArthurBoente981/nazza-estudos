import provimento from './conteudo/8112-provimento.json'

// Seção 1 do edital (Conhecimentos de Administração Pública).
// Só a primeira lição tem conteúdo na Fase 0; o resto aparece trancado pra dar a ideia do roadmap.
export const secoes = [
  {
    titulo: 'Seção 1 · Administração Pública',
    cor: '#7c4dff',
    unidades: [
      { nome: 'Lei 8.112: Provimento', licoes: [provimento, null, null] },
      { nome: 'Lei 8.112: Vacância e movimentação', licoes: [null, null, null] },
      { nome: 'Lei 8.112: Vantagens e licenças', licoes: [null, null, null] },
      { nome: 'Lei 8.112: Regime disciplinar', licoes: [null, null, null] },
      { nome: 'Princípios constitucionais', licoes: [null, null] },
      { nome: 'Ética (Decreto 1.171)', licoes: [null, null] },
      { nome: 'Carreira TAE (Lei 11.091)', licoes: [null, null] },
      { nome: 'Processo administrativo (Lei 9.784)', licoes: [null, null, null] },
      { nome: 'Organização administrativa', licoes: [null, null] },
      { nome: 'Improbidade (Lei 8.429)', licoes: [null, null] },
      { nome: 'Gestão orçamentária (AFO)', licoes: [null, null, null] },
    ],
  },
]
