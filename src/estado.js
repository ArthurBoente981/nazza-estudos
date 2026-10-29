// Progresso do usuário, guardado no próprio aparelho.
const CHAVE = 'nazza-estudos-v1'

function hoje() {
  return new Date().toLocaleDateString('sv-SE') // AAAA-MM-DD
}

function tresMeses() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toLocaleDateString('sv-SE')
}

export function carregar() {
  let salvo = {}
  try {
    salvo = JSON.parse(localStorage.getItem(CHAVE)) || {}
  } catch {
    salvo = {}
  }
  const estado = { xp: 0, ofensiva: 0, ultimoDia: null, feitas: {}, dataProva: tresMeses(), ...salvo }
  // Ofensiva quebra se pulou um dia inteiro
  if (estado.ultimoDia) {
    const dias = (new Date(hoje()) - new Date(estado.ultimoDia)) / 86400000
    if (dias > 1) estado.ofensiva = 0
  }
  return estado
}

export function salvar(estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // sem armazenamento: segue só na memória
  }
}

export function concluirLicao(estado, id, xpGanho, acertos, total) {
  const novo = { ...estado, xp: estado.xp + xpGanho, feitas: { ...estado.feitas } }
  const antes = novo.feitas[id] || { vezes: 0, melhor: 0 }
  novo.feitas[id] = { vezes: antes.vezes + 1, melhor: Math.max(antes.melhor, Math.round((acertos / total) * 100)) }
  if (estado.ultimoDia !== hoje()) {
    novo.ofensiva = estado.ofensiva + 1
    novo.ultimoDia = hoje()
  }
  return novo
}

export function diasParaProva(estado) {
  return Math.max(0, Math.ceil((new Date(estado.dataProva) - new Date(hoje())) / 86400000))
}

export function fezHoje(estado) {
  return estado.ultimoDia === hoje()
}
