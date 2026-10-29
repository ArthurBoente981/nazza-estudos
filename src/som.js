// Sons sintetizados na hora (sem arquivos de áudio).
let ctx = null

function nota(freq, inicio, dur, tipo = 'sine', vol = 0.18) {
  const t = ctx.currentTime + inicio
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = tipo
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  osc.connect(g).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

const sons = {
  certo: () => { nota(784, 0, 0.12, 'triangle'); nota(1175, 0.09, 0.22, 'triangle') },
  errado: () => { nota(220, 0, 0.18, 'square', 0.07); nota(185, 0.12, 0.26, 'square', 0.07) },
  toque: () => nota(660, 0, 0.05, 'sine', 0.06),
  fim: () => [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.11, 0.3, 'triangle', 0.16)),
}

export function tocar(nome, config) {
  if (!config.sons) return
  try {
    ctx = ctx || new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    sons[nome]()
  } catch {
    // sem áudio disponível
  }
}

export function vibrar(padrao, config) {
  if (config.vibracao && navigator.vibrate) navigator.vibrate(padrao)
}
