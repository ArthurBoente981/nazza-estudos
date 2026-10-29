import { useEffect, useState } from 'react'
import Licao, { embaralha } from './Licao.jsx'
import Trilha from './telas/Trilha.jsx'
import Praticar from './telas/Praticar.jsx'
import Perfil from './telas/Perfil.jsx'
import Ajustes from './telas/Ajustes.jsx'
import { Icone, Nazza } from './Nazza.jsx'
import { carregar, salvar, registrarSessao, diasParaProva, fezHoje, xpHoje } from './estado.js'

const ABAS = [
  { id: 'trilha', nome: 'Trilha', icone: 'Map' },
  { id: 'praticar', nome: 'Praticar', icone: 'Dumbbell' },
  { id: 'perfil', nome: 'Perfil', icone: 'ChartNoAxesColumn' },
  { id: 'ajustes', nome: 'Ajustes', icone: 'Settings' },
]

export default function App() {
  const [estado, setEstado] = useState(carregar)
  const [aba, setAba] = useState('trilha')
  const [sessao, setSessao] = useState(null) // { titulo, subtitulo, dica?, questoes, licaoId? }
  const c = estado.config

  // Aplica tema, tamanho do texto e animações no <html>
  useEffect(() => {
    const html = document.documentElement
    if (c.tema === 'sistema') delete html.dataset.theme
    else html.dataset.theme = c.tema === 'claro' ? 'light' : 'dark'
    html.dataset.texto = c.texto
    html.dataset.animacoes = c.animacoes
  }, [c.tema, c.texto, c.animacoes])

  function atualizar(novo) {
    setEstado(novo)
    salvar(novo)
  }

  function iniciarLicao(l) {
    const n = c.questoesPorLicao
    const questoes = n && n < l.questoes.length ? embaralha(l.questoes).slice(0, n) : l.questoes
    setSessao({ titulo: l.titulo, subtitulo: l.unidade, dica: l.dica, questoes, licaoId: l.id })
  }

  if (sessao) {
    return (
      <Licao key={sessao.titulo + sessao.questoes.length} {...sessao} config={c}
        aoSair={() => setSessao(null)}
        aoConcluir={(r) => {
          atualizar(registrarSessao(estado, { ...r, licaoId: sessao.licaoId }))
          setSessao(null)
        }} />
    )
  }

  const meta = c.metaDiaria
  const hojeXp = xpHoje(estado)

  return (
    <div className="app">
      <nav className="navegacao" aria-label="Principal">
        <div className="marca">
          <img src={`${import.meta.env.BASE_URL}nazza/feliz.webp`} alt="" />
          <span>Estuda com a <b>Nazza</b></span>
        </div>
        {ABAS.map((a) => (
          <button key={a.id} className={'aba' + (aba === a.id ? ' ativa' : '')} onClick={() => { setAba(a.id); window.scrollTo(0, 0) }}
            aria-current={aba === a.id ? 'page' : undefined}>
            <Icone nome={a.icone} size={24} />
            <span>{a.nome}</span>
          </button>
        ))}
      </nav>

      <div className="conteudo">
        <header className="topo-stats">
          <Chip icone="Flame" cor={fezHoje(estado) ? 'laranja' : 'apagado'} valor={estado.ofensiva} titulo="Dias seguidos" />
          <Chip icone="Zap" cor="ouro" valor={estado.xp} titulo="XP total" />
          <Chip icone="CalendarClock" cor="azul" valor={`${diasParaProva(estado)}d`} titulo="Dias até a prova" />
        </header>
        <main>
          {aba === 'trilha' && <Trilha estado={estado} aoIniciar={iniciarLicao} />}
          {aba === 'praticar' && <Praticar estado={estado} aoTreinar={(s) => setSessao(s)} />}
          {aba === 'perfil' && <Perfil estado={estado} />}
          {aba === 'ajustes' && <Ajustes estado={estado} aoMudar={atualizar} />}
        </main>
      </div>

      <aside className="painel">
        <div className="cartao painel-cartao">
          <div className="painel-linha">
            <Icone nome="Flame" size={28} className={fezHoje(estado) ? 'cor-laranja-txt' : 'apagado-txt'} />
            <div>
              <b>{estado.ofensiva} {estado.ofensiva === 1 ? 'dia seguido' : 'dias seguidos'}</b>
              <p>{fezHoje(estado) ? 'Ofensiva garantida hoje!' : 'Faça uma lição pra manter a chama.'}</p>
            </div>
          </div>
        </div>
        <div className="cartao painel-cartao">
          <h3>Meta diária</h3>
          <div className="meta">
            <div className="meta-barra"><div style={{ width: `${Math.min(100, (hojeXp / meta) * 100)}%` }} /></div>
            <span>{Math.min(hojeXp, meta)}/{meta} XP</span>
          </div>
        </div>
        <div className="cartao painel-cartao">
          <h3>Contagem regressiva</h3>
          <div className="painel-linha">
            <span className="numero-grande">{diasParaProva(estado)}</span>
            <p>dias até a prova<br /><small>{new Date(c.dataProva + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</small></p>
          </div>
        </div>
        <div className="cartao painel-cartao painel-nazza">
          <Nazza emote="piscando" tamanho="p" fala="Dica: errou? A questão volta no fim da lição e na aba Praticar." />
        </div>
      </aside>
    </div>
  )
}

function Chip({ icone, cor, valor, titulo }) {
  return (
    <span className={`chip cor-${cor}-txt`} title={titulo}>
      <Icone nome={icone} size={20} fill={cor === 'apagado' ? 'none' : 'currentColor'} fillOpacity={0.25} />
      {valor}
    </span>
  )
}
