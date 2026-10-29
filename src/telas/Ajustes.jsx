import { useRef, useState } from 'react'
import { tresMeses, configPadrao, carregar } from '../estado.js'
import { Icone } from '../Nazza.jsx'
import BotaoInstalar from '../BotaoInstalar.jsx'

const CHAVE = 'nazza-estudos-v1'

export default function Ajustes({ estado, aoMudar }) {
  const c = estado.config
  const [confirmarZerar, setConfirmarZerar] = useState(false)
  const arquivo = useRef(null)
  const muda = (campo, valor) => aoMudar({ ...estado, config: { ...c, [campo]: valor } })

  function exportar() {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `nazza-backup-${new Date().toLocaleDateString('sv-SE')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function importar(e) {
    const f = e.target.files[0]
    if (!f) return
    f.text().then((txt) => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(JSON.parse(txt)))
        aoMudar(carregar())
        alert('Backup restaurado!')
      } catch {
        alert('Esse arquivo não é um backup válido.')
      }
    })
  }

  function zerar() {
    aoMudar({ xp: 0, ofensiva: 0, melhorOfensiva: 0, ultimoDia: null, xpPorDia: {}, feitas: {}, historico: {}, config: c })
    setConfirmarZerar(false)
  }

  return (
    <div className="tela">
      <header className="tela-topo">
        <h1>Ajustes</h1>
      </header>

      <BotaoInstalar sempre />

      <Grupo titulo="Aparência" icone="Palette">
        <Linha rotulo="Tema">
          <Segmentos valor={c.tema} aoMudar={(v) => muda('tema', v)}
            opcoes={[['sistema', 'Auto'], ['claro', 'Claro'], ['escuro', 'Escuro']]} />
        </Linha>
        <Linha rotulo="Tamanho do texto">
          <Segmentos valor={c.texto} aoMudar={(v) => muda('texto', v)}
            opcoes={[['p', 'A-'], ['m', 'A'], ['g', 'A+']]} />
        </Linha>
        <Linha rotulo="Animações" ajuda="Reduzidas deixa a Nazza mais quieta e tira o confete">
          <Segmentos valor={c.animacoes} aoMudar={(v) => muda('animacoes', v)}
            opcoes={[['completas', 'Completas'], ['reduzidas', 'Reduzidas']]} />
        </Linha>
      </Grupo>

      <Grupo titulo="Estudo" icone="GraduationCap">
        <Linha rotulo="Data da prova">
          <div className="data-prova">
            <input type="date" value={c.dataProva} onChange={(e) => e.target.value && muda('dataProva', e.target.value)} />
            <button className="botao-mini" onClick={() => muda('dataProva', tresMeses())}>+3 meses</button>
          </div>
        </Linha>
        <Linha rotulo="Meta diária">
          <Segmentos valor={c.metaDiaria} aoMudar={(v) => muda('metaDiaria', v)}
            opcoes={[[10, '10'], [20, '20'], [30, '30'], [50, '50']]} sufixo=" XP" />
        </Linha>
        <Linha rotulo="Questões por lição">
          <Segmentos valor={c.questoesPorLicao} aoMudar={(v) => muda('questoesPorLicao', v)}
            opcoes={[[6, '6'], [8, '8'], [10, '10'], [0, 'Todas']]} />
        </Linha>
        <Interruptor rotulo="Mostrar dica antes da lição" valor={c.mostrarDica} aoMudar={(v) => muda('mostrarDica', v)} />
        <Interruptor rotulo="Embaralhar alternativas" valor={c.embaralhar} aoMudar={(v) => muda('embaralhar', v)} />
      </Grupo>

      <Grupo titulo="Som e toque" icone="Volume2">
        <Interruptor rotulo="Efeitos sonoros" valor={c.sons} aoMudar={(v) => muda('sons', v)} />
        <Interruptor rotulo="Vibração" valor={c.vibracao} aoMudar={(v) => muda('vibracao', v)} />
      </Grupo>

      <Grupo titulo="Seus dados" icone="Database">
        <button className="linha-botao" onClick={exportar}><Icone nome="Download" size={20} /> Exportar backup</button>
        <button className="linha-botao" onClick={() => arquivo.current.click()}><Icone nome="Upload" size={20} /> Importar backup</button>
        <input ref={arquivo} type="file" accept="application/json" hidden onChange={importar} />
        <button className="linha-botao perigo" onClick={() => setConfirmarZerar(true)}><Icone nome="Trash2" size={20} /> Zerar progresso</button>
        <button className="linha-botao" onClick={() => aoMudar({ ...estado, config: { ...configPadrao, dataProva: c.dataProva } })}>
          <Icone nome="RotateCcw" size={20} /> Voltar ajustes ao padrão
        </button>
      </Grupo>

      <p className="rodape-ajustes">Estuda com a Nazza · v0.2 · seu progresso fica só neste aparelho</p>

      {confirmarZerar && (
        <div className="modal-fundo" onClick={() => setConfirmarZerar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Zerar tudo?</h2>
            <p>XP, ofensiva, lições e histórico de respostas serão apagados. Os ajustes ficam. Não dá pra desfazer (a não ser com um backup).</p>
            <button className="botao perigo" onClick={zerar}>Zerar progresso</button>
            <button className="botao secundario" onClick={() => setConfirmarZerar(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Grupo({ titulo, icone, children }) {
  return (
    <section className="grupo">
      <h2 className="secao-titulo"><Icone nome={icone} size={16} /> {titulo}</h2>
      <div className="cartao lista-ajustes">{children}</div>
    </section>
  )
}

function Linha({ rotulo, ajuda, children }) {
  return (
    <div className="linha-ajuste">
      <div className="linha-rotulo">
        <span>{rotulo}</span>
        {ajuda && <small>{ajuda}</small>}
      </div>
      {children}
    </div>
  )
}

function Segmentos({ valor, opcoes, aoMudar, sufixo = '' }) {
  return (
    <div className="segmentos" role="radiogroup">
      {opcoes.map(([v, nome]) => (
        <button key={v} role="radio" aria-checked={valor === v} className={valor === v ? 'ativo' : ''} onClick={() => aoMudar(v)}>
          {nome}{valor === v && typeof v === 'number' && v > 0 ? sufixo : ''}
        </button>
      ))}
    </div>
  )
}

function Interruptor({ rotulo, valor, aoMudar }) {
  return (
    <label className="linha-ajuste interruptor">
      <span>{rotulo}</span>
      <input type="checkbox" role="switch" checked={valor} onChange={(e) => aoMudar(e.target.checked)} />
      <span className="trilho" aria-hidden="true"><span /></span>
    </label>
  )
}
