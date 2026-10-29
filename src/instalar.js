// Instalação do app (PWA). O Chrome dispara `beforeinstallprompt` quando dá pra instalar;
// guardamos o evento pra mostrar nosso próprio botão "Instalar app".
let pedido = null
const ouvintes = new Set()
const avisa = () => ouvintes.forEach((f) => f())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  pedido = e
  avisa()
})
window.addEventListener('appinstalled', () => {
  pedido = null
  avisa()
})

export function ouvir(f) {
  ouvintes.add(f)
  return () => ouvintes.delete(f)
}

export function situacao() {
  const ua = navigator.userAgent
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return 'instalado'
  if (pedido) return 'pode'
  if (/WhatsApp|Instagram|FBAN|FBAV|Telegram|; wv\)/i.test(ua)) return 'navegador-interno'
  if (/iPhone|iPad/i.test(ua)) return 'ios'
  if (/SamsungBrowser/i.test(ua)) return 'samsung'
  if (/Firefox/i.test(ua)) return 'firefox'
  return 'manual'
}

export async function instalar() {
  if (!pedido) return false
  pedido.prompt()
  const { outcome } = await pedido.userChoice
  pedido = null
  avisa()
  return outcome === 'accepted'
}

export const instrucoes = {
  'navegador-interno': 'Você abriu pelo navegador do WhatsApp/Instagram, que não instala apps. Toque em ⋮ e escolha "Abrir no Chrome", depois volte aqui.',
  ios: 'No Safari, toque em Compartilhar (□↑) e depois em "Adicionar à Tela de Início".',
  samsung: 'Toque no menu ☰ lá embaixo e depois em "Adicionar página a" → "Tela inicial".',
  firefox: 'Toque em ⋮ e depois em "Instalar" (ou "Adicionar à tela inicial").',
  manual: 'No Chrome, toque em ⋮ (canto de cima) e depois em "Instalar app" ou "Adicionar à tela inicial" → "Instalar". Se não aparecer, recarregue a página uma vez.',
}
