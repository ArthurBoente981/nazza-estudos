import { hoje, conquistas, precisao, diasParaProva } from '../estado.js'
import { todasQuestoes } from '../trilha.js'
import { Icone } from '../Nazza.jsx'

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export default function Perfil({ estado }) {
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = hoje(i - 6)
    return { d, xp: estado.xpPorDia[d] || 0, letra: DIAS[new Date(d + 'T12:00').getDay()] }
  })
  const maior = Math.max(estado.config.metaDiaria, ...semana.map((s) => s.xp))
  const respondidas = Object.values(estado.historico).reduce((s, h) => s + h.a + h.e, 0)
  const p = precisao(estado, todasQuestoes)
  const lista = conquistas(estado)

  return (
    <div className="tela">
      <header className="tela-topo">
        <h1>Seu progresso</h1>
        <p>Faltam {diasParaProva(estado)} dias pra prova.</p>
      </header>

      <div className="grade-stats">
        <Stat cor="laranja" icone="Flame" valor={estado.ofensiva} rotulo="Ofensiva" />
        <Stat cor="ouro" icone="Zap" valor={estado.xp} rotulo="XP total" />
        <Stat cor="verde" icone="Target" valor={p === null ? '—' : `${p}%`} rotulo="Precisão" />
        <Stat cor="azul" icone="ListChecks" valor={respondidas} rotulo="Respostas" />
        <Stat cor="roxo" icone="BookCheck" valor={Object.keys(estado.feitas).length} rotulo="Lições" />
        <Stat cor="rosa" icone="Crown" valor={estado.melhorOfensiva} rotulo="Melhor ofensiva" />
      </div>

      <h2 className="secao-titulo">Últimos 7 dias</h2>
      <div className="cartao grafico">
        <div className="barras">
          {semana.map((s) => (
            <div key={s.d} className={'barra-dia' + (s.d === hoje() ? ' hoje' : '')}>
              <span className="barra-valor">{s.xp || ''}</span>
              <div className="barra-trilho">
                <div className={s.xp >= estado.config.metaDiaria ? 'meta-ok' : ''} style={{ height: `${(s.xp / maior) * 100}%` }} />
              </div>
              <span className="barra-letra">{s.letra}</span>
            </div>
          ))}
          <div className="linha-meta" style={{ bottom: `calc(${(estado.config.metaDiaria / maior) * 100}% * 0.78 + 26px)` }}>
            <span>meta</span>
          </div>
        </div>
      </div>

      <h2 className="secao-titulo">Conquistas</h2>
      <div className="grade-conquistas">
        {lista.map((c) => (
          <div key={c.id} className={'conquista' + (c.ok ? ' ok' : '')}>
            <span className="conquista-icone"><Icone nome={c.ok ? c.icone : 'Lock'} size={26} /></span>
            <h3>{c.nome}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ cor, icone, valor, rotulo }) {
  return (
    <div className={`stat cor-${cor}`}>
      <Icone nome={icone} size={22} />
      <div>
        <b>{valor}</b>
        <span>{rotulo}</span>
      </div>
    </div>
  )
}
