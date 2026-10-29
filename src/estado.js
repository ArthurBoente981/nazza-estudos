// Progresso e configurações, guardados no próprio aparelho.
const CHAVE = 'nazza-estudos-v1'

export function hoje(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString('sv-SE') // AAAA-MM-DD
}

export function tresMeses() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toLocaleDateString('sv-SE')
}

export const configPadrao = {
  tema: 'sistema', // sistema | claro | escuro
  texto: 'm', // p | m | g
  animacoes: 'completas', // completas | reduzidas
  dataProva: null, // null = hoje + 3 meses
  metaDiaria: 20,
  questoesPorLicao: 12, // 0 = todas
  mostrarDica: true,
  embaralhar: true,
  sons: true,
  vibracao: true,
}

const estadoPadrao = {
  xp: 0,
  ofensiva: 0,
  melhorOfensiva: 0,
  ultimoDia: null,
  xpPorDia: {}, // { 'AAAA-MM-DD': xp }
  feitas: {}, // { licaoId: { vezes, melhor } }
  historico: {}, // { questaoId: { a: acertos, e: erros, t: último dia } }
  config: configPadrao,
}

export function carregar() {
  let salvo = {}
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE)) || {}
  } catch {
    salvo = {}
  }
  const estado = { ...estadoPadrao, ...salvo, config: { ...configPadrao, ...salvo.config } }
  if (!estado.config.dataProva) estado.config.dataProva = tresMeses()
  // Ofensiva quebra se pulou um dia inteiro
  if (estado.ultimoDia && estado.ultimoDia < hoje(-1)) estado.ofensiva = 0
  return estado
}

export function salvar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // sem armazenamento: segue só na memória
  }
}

// respostas: [{ id, certo }]; licaoId é null em treino livre
export function registrarSessao(estado, { licaoId, xp, deCara, total, respostas }) {
  const novo = {
    ...estado,
    xp: estado.xp + xp,
    xpPorDia: { ...estado.xpPorDia, [hoje()]: (estado.xpPorDia[hoje()] || 0) + xp },
    feitas: { ...estado.feitas },
    historico: { ...estado.historico },
  }
  if (licaoId) {
    const antes = novo.feitas[licaoId] || { vezes: 0, melhor: 0 }
    novo.feitas[licaoId] = { vezes: antes.vezes + 1, melhor: Math.max(antes.melhor, Math.round((deCara / total) * 100)) }
  }
  for (const r of respostas) {
    const h = novo.historico[r.id] || { a: 0, e: 0 }
    novo.historico[r.id] = { a: h.a + (r.certo ? 1 : 0), e: h.e + (r.certo ? 0 : 1), t: hoje() }
  }
  if (estado.ultimoDia !== hoje()) {
    novo.ofensiva = estado.ultimoDia === hoje(-1) ? estado.ofensiva + 1 : 1
    novo.ultimoDia = hoje()
    novo.melhorOfensiva = Math.max(novo.melhorOfensiva, novo.ofensiva)
  }
  return novo
}

export function diasParaProva(estado) {
  return Math.max(0, Math.ceil((new Date(estado.config.dataProva) - new Date(hoje())) / 86400000))
}

export const fezHoje = (estado) => estado.ultimoDia === hoje()
export const xpHoje = (estado) => estado.xpPorDia[hoje()] || 0

// Questões que você mais erra do que acerta
export function errosPendentes(estado, questoes) {
  return questoes.filter((q) => {
    const h = estado.historico[q.id]
    return h && h.e > 0 && h.e >= h.a
  })
}

export function precisao(estado, questoes) {
  let a = 0
  let t = 0
  for (const q of questoes) {
    const h = estado.historico[q.id]
    if (h) {
      a += h.a
      t += h.a + h.e
    }
  }
  return t ? Math.round((a / t) * 100) : null
}

export function conquistas(estado) {
  const respondidas = Object.values(estado.historico).reduce((s, h) => s + h.a + h.e, 0)
  const gabaritos = Object.values(estado.feitas).filter((f) => f.melhor === 100).length
  return [
    { id: 'primeira', nome: 'Primeiro passo', desc: 'Conclua uma lição', icone: 'Footprints', ok: Object.keys(estado.feitas).length >= 1 },
    { id: 'gabarito', nome: 'Gabaritou', desc: 'Lição sem nenhum erro', icone: 'Target', ok: gabaritos >= 1 },
    { id: 'ofensiva3', nome: 'Pegando ritmo', desc: '3 dias seguidos', icone: 'Flame', ok: estado.melhorOfensiva >= 3 },
    { id: 'ofensiva7', nome: 'Semana cheia', desc: '7 dias seguidos', icone: 'CalendarCheck', ok: estado.melhorOfensiva >= 7 },
    { id: 'xp100', nome: 'Centenária', desc: '100 XP no total', icone: 'Zap', ok: estado.xp >= 100 },
    { id: 'q100', nome: 'Maratonista', desc: '100 questões respondidas', icone: 'Medal', ok: respondidas >= 100 },
  ]
}
