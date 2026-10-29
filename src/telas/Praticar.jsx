import { categorias, todasQuestoes, materias } from '../trilha.js'
import { errosPendentes, precisao } from '../estado.js'
import { embaralha } from '../Licao.jsx'
import { Icone, Nazza } from '../Nazza.jsx'

export default function Praticar({ estado, aoTreinar }) {
  const erros = errosPendentes(estado, todasQuestoes)
  const limite = estado.config.questoesPorLicao || 999

  function treinar(titulo, subtitulo, lista) {
    aoTreinar({ titulo, subtitulo, questoes: embaralha(lista).slice(0, Math.min(limite, 10)) })
  }

  return (
    <div className="tela">
      <header className="tela-topo">
        <h1>Praticar</h1>
        <p>Treine por categoria, matéria ou só o que você errou.</p>
      </header>

      <div className="destaques">
        <button className="cartao-acao cor-rosa" disabled={!erros.length}
          onClick={() => treinar('Revisar erros', 'Treino', erros)}>
          <Nazza emote={erros.length ? 'nervosa' : 'confiante'} tamanho="p" />
          <div>
            <h3>Revisar erros</h3>
            <p>{erros.length ? `${erros.length} questões pra reforçar` : 'Nenhum erro pendente 💅'}</p>
          </div>
          <Icone nome="ChevronRight" size={22} />
        </button>
        <button className="cartao-acao cor-roxo" onClick={() => treinar('Treino rápido', 'Treino', todasQuestoes)}>
          <span className="cartao-icone"><Icone nome="Zap" size={26} /></span>
          <div>
            <h3>Treino rápido</h3>
            <p>10 questões misturadas</p>
          </div>
          <Icone nome="ChevronRight" size={22} />
        </button>
      </div>

      <h2 className="secao-titulo">Por categoria</h2>
      <div className="grade-categorias">
        {Object.entries(categorias).map(([id, c]) => {
          const lista = todasQuestoes.filter((q) => q.categoria === id)
          const p = precisao(estado, lista)
          return (
            <button key={id} className={`categoria cor-${c.cor}`} disabled={!lista.length}
              onClick={() => treinar(c.nome, 'Categoria', lista)}>
              <span className="categoria-icone"><Icone nome={c.icone} size={24} /></span>
              <h3>{c.nome}</h3>
              <span className="categoria-info">{lista.length} questões</span>
              <div className="mini-barra"><div style={{ width: `${p ?? 0}%` }} /></div>
              <span className="categoria-info">{p === null ? 'Ainda não treinada' : `${p}% de acerto`}</span>
            </button>
          )
        })}
      </div>

      <h2 className="secao-titulo">Por matéria</h2>
      <div className="lista">
        {materias.map((m) => {
          const lista = todasQuestoes.filter((q) => q.materia === m)
          const p = precisao(estado, lista)
          return (
            <button key={m} className="item-lista" onClick={() => treinar(m, 'Matéria', lista)}>
              <span className="cartao-icone pequeno cor-azul"><Icone nome="Landmark" size={20} /></span>
              <div>
                <h3>{m}</h3>
                <p>{lista.length} questões{p !== null ? ` · ${p}% de acerto` : ''}</p>
              </div>
              <Icone nome="ChevronRight" size={20} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
