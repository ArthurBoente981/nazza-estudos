import { useEffect, useMemo, useRef, useState } from 'react'
import { Nazza, NazzaVideo, Icone, Confete } from './Nazza.jsx'
import { tocar, vibrar } from './som.js'

const ACERTO = ['rindo', 'gargalhando', 'piscando', 'apaixonada', 'confiante']
const ERRO = ['chorando', 'nervosa', 'surpresa', 'brava']
const FALAS_ACERTO = ['Isso aí!', 'Mandou bem!', 'Arrasou!', 'Perfeito!', 'Essa caiu fácil, hein?']
const FALAS_ERRO = ['Quase! Lê a explicação.', 'Essa é pegadinha clássica…', 'Vou te cobrar de novo no fim 👀', 'Respira e lê o artigo.']
const FALAS_COMBO = ['Tá voando! 🔥', 'Ninguém te segura!', 'Sequência linda!']

const TIPOS = {
  mc: { nome: 'Múltipla escolha', icone: 'ListChecks', fala: 'Escolhe a certa:' },
  ce: { nome: 'Certo ou errado', icone: 'CheckCheck', fala: 'Certo ou errado?' },
  lacuna: { nome: 'Complete a lei', icone: 'PenLine', fala: 'Completa a lei pra mim:' },
  pares: { nome: 'Ligue os pares', icone: 'Link2', fala: 'Liga cada um com o seu par:' },
}

const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)]

export function embaralha(lista) {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Embaralha as alternativas de múltipla escolha mantendo o gabarito certo
function preparaQuestao(q, config) {
  if (q.tipo !== 'mc' || !config.embaralhar) return q
  const ordem = embaralha(q.opcoes.map((_, i) => i))
  return { ...q, opcoes: ordem.map((i) => q.opcoes[i]), correta: ordem.indexOf(q.correta) }
}

function textoResposta(q) {
  if (q.tipo === 'mc') return q.opcoes[q.correta]
  if (q.tipo === 'ce') return q.correta ? 'Certo' : 'Errado'
  if (q.tipo === 'pares') return 'confira os pares abaixo'
  return q.correta
}

export default function Licao({ titulo, subtitulo, dica, questoes, config, aoSair, aoConcluir }) {
  const [fila, setFila] = useState(() => questoes.map((q, i) => ({ ...preparaQuestao(q, config), pos: i })))
  const [etapa, setEtapa] = useState(dica && config.mostrarDica ? 'dica' : 'questao') // dica | questao | fim
  const [escolha, setEscolha] = useState(null)
  const [resultado, setResultado] = useState(null) // null | 'certo' | 'errado'
  const [acertadas, setAcertadas] = useState(() => new Set())
  const [erradas, setErradas] = useState(() => new Set())
  const [respostas, setRespostas] = useState([])
  const [combo, setCombo] = useState(0)
  const [reacao, setReacao] = useState({ tipo: null, id: 0, emote: 'pensativa', fala: null })
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const inicio = useRef(Date.now())

  const total = questoes.length
  const q = fila[0]
  const respondida = resultado !== null
  const banco = useMemo(() => (q?.tipo === 'lacuna' ? embaralha(q.banco) : []), [q])

  function responder(certo) {
    setResultado(certo ? 'certo' : 'errado')
    setRespostas((r) => [...r, { id: q.id, certo }])
    if (certo) {
      const novoCombo = combo + 1
      setCombo(novoCombo)
      setAcertadas((s) => new Set(s).add(q.pos))
      setReacao({ tipo: 'pulo', id: Date.now(), emote: sorteia(ACERTO), fala: novoCombo >= 3 ? sorteia(FALAS_COMBO) : sorteia(FALAS_ACERTO) })
      tocar('certo', config)
      vibrar(30, config)
    } else {
      setCombo(0)
      setErradas((s) => new Set(s).add(q.pos))
      setReacao({ tipo: 'treme', id: Date.now(), emote: sorteia(ERRO), fala: sorteia(FALAS_ERRO) })
      tocar('errado', config)
      vibrar([60, 40, 90], config)
    }
  }

  function verificar() {
    if (escolha === null || respondida) return
    responder(escolha === q.correta)
  }

  function proxima() {
    const resto = fila.slice(1)
    const novaFila = resultado === 'errado' ? [...resto, q] : resto
    setEscolha(null)
    setResultado(null)
    setReacao((r) => ({ ...r, tipo: null, emote: 'pensativa', fala: null }))
    if (novaFila.length === 0) {
      tocar('fim', config)
      setEtapa('fim')
    } else setFila(novaFila)
  }

  // Atalhos de teclado (PC): 1–5 escolhe, Enter verifica/continua
  useEffect(() => {
    function tecla(e) {
      if (etapa !== 'questao' || confirmarSaida || !q) return
      if (e.key === 'Enter') {
        e.preventDefault()
        respondida ? proxima() : verificar()
        return
      }
      if (respondida) return
      const n = Number(e.key) - 1
      if (q.tipo === 'mc' && n >= 0 && n < q.opcoes.length) setEscolha(n)
      if (q.tipo === 'ce' && (n === 0 || n === 1)) setEscolha(n === 0)
      if (q.tipo === 'lacuna' && n >= 0 && n < banco.length) setEscolha(banco[n])
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  })

  if (etapa === 'dica') {
    return (
      <div className="licao">
        <BarraTopo progresso={0} aoSair={aoSair} />
        <main className="licao-corpo centro">
          <span className="sobretitulo">{subtitulo}</span>
          <h1 className="titulo-licao">{titulo}</h1>
          <div className="cartao-dica">
            <Nazza emote="confiante" tamanho="g" vertical />
            <div className="dica-texto">
              <span className="rotulo"><Icone nome="Lightbulb" size={16} /> Dica da Nazza</span>
              <p>{dica}</p>
            </div>
          </div>
        </main>
        <footer className="rodape">
          <button className="botao primario" onClick={() => setEtapa('questao')}>Bora!</button>
        </footer>
      </div>
    )
  }

  if (etapa === 'fim') {
    const deCara = total - erradas.size
    const perc = Math.round((deCara / total) * 100)
    const xp = 10 + deCara + (perc === 100 ? 5 : 0)
    const segs = Math.round((Date.now() - inicio.current) / 1000)
    return (
      <div className="licao fim">
        {config.animacoes === 'completas' && <Confete />}
        <main className="licao-corpo centro">
          <NazzaVideo nome="paz" className="video-fim" />
          <h1 className="titulo-fim">{perc === 100 ? 'Gabaritou!' : 'Lição concluída!'}</h1>
          <p className="sub-fim">{perc === 100 ? 'Nenhum erro. A Nazza tá orgulhosa 😍' : perc >= 70 ? 'Mandou bem! Os erros voltam na revisão.' : 'Valeu o esforço! Vamos reforçar esses pontos.'}</p>
          <div className="placar">
            <Bloco cor="ouro" icone="Zap" rotulo="XP ganho" valor={`+${xp}`} />
            <Bloco cor="verde" icone="Target" rotulo="Precisão" valor={`${perc}%`} />
            <Bloco cor="azul" icone="Clock" rotulo="Tempo" valor={`${Math.floor(segs / 60)}:${String(segs % 60).padStart(2, '0')}`} />
          </div>
        </main>
        <footer className="rodape">
          <button className="botao primario" onClick={() => aoConcluir({ xp, deCara, total, respostas })}>Continuar</button>
        </footer>
      </div>
    )
  }

  const tipo = TIPOS[q.tipo]
  const jaErrou = erradas.has(q.pos) && !respondida

  return (
    <div className="licao">
      <BarraTopo progresso={acertadas.size / total} combo={combo} aoSair={() => setConfirmarSaida(true)} />
      <main className="licao-corpo" key={q.pos + '-' + respostas.length}>
        <div className="etiquetas">
          <span className="etiqueta"><Icone nome={tipo.icone} size={14} /> {tipo.nome}</span>
          {jaErrou && <span className="etiqueta revisao"><Icone nome="RotateCcw" size={14} /> Errou antes</span>}
        </div>

        <Nazza emote={reacao.emote} reacao={reacao.tipo} reacaoId={reacao.id} fala={reacao.fala || tipo.fala} />

        {q.tipo === 'mc' && (
          <>
            <p className="enunciado">{q.enunciado}</p>
            <div className="opcoes">
              {q.opcoes.map((op, i) => (
                <button key={i} disabled={respondida}
                  className={'opcao' + (escolha === i ? ' marcada' : '') + (respondida && i === q.correta ? ' gabarito' : '') + (respondida && escolha === i && i !== q.correta ? ' errada' : '')}
                  onClick={() => { setEscolha(i); tocar('toque', config) }}>
                  <span className="letra">{'ABCDE'[i]}</span>
                  <span>{op}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {q.tipo === 'ce' && (
          <>
            <p className="enunciado destaque">{q.enunciado}</p>
            <div className="ce">
              {[true, false].map((v) => (
                <button key={String(v)} disabled={respondida}
                  className={'opcao ce-' + (v ? 'certo' : 'errado') + (escolha === v ? ' marcada' : '') + (respondida && v === q.correta ? ' gabarito' : '') + (respondida && escolha === v && v !== q.correta ? ' errada' : '')}
                  onClick={() => { setEscolha(v); tocar('toque', config) }}>
                  <Icone nome={v ? 'Check' : 'X'} size={28} />
                  {v ? 'Certo' : 'Errado'}
                </button>
              ))}
            </div>
          </>
        )}

        {q.tipo === 'lacuna' && (
          <>
            <p className="enunciado lacuna">
              {q.texto.split('___')[0]}
              <button className={'buraco' + (escolha ? ' preenchido' : '') + (respondida ? ' ' + resultado : '')}
                disabled={respondida} onClick={() => setEscolha(null)}>
                {escolha || ' '}
              </button>
              {q.texto.split('___')[1]}
            </p>
            <div className="banco">
              {banco.map((p) => (
                <button key={p} disabled={respondida || escolha === p}
                  className={'ficha' + (escolha === p ? ' usada' : '')}
                  onClick={() => { setEscolha(p); tocar('toque', config) }}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {q.tipo === 'pares' && <Pares q={q} config={config} bloqueado={respondida} aoTerminar={responder} />}
      </main>

      <footer className={'rodape' + (respondida ? ' ' + resultado : '')}>
        {respondida && (
          <div className="feedback">
            <div className="feedback-titulo">
              <span className="feedback-icone"><Icone nome={resultado === 'certo' ? 'Check' : 'X'} size={22} /></span>
              <b>{resultado === 'certo' ? 'Correto!' : 'Resposta certa: ' + textoResposta(q)}</b>
            </div>
            <p>{q.explicacao}</p>
            <span className="artigo"><Icone nome="ScrollText" size={14} /> {q.fonte} · {q.artigo}</span>
          </div>
        )}
        {q.tipo !== 'pares' || respondida ? (
          respondida ? (
            <button className={'botao ' + (resultado === 'certo' ? 'primario' : 'perigo')} onClick={proxima}>Continuar</button>
          ) : (
            <button className="botao primario" disabled={escolha === null} onClick={verificar}>Verificar</button>
          )
        ) : (
          <button className="botao fantasma" onClick={() => responder(false)}>Não sei</button>
        )}
      </footer>

      {confirmarSaida && (
        <div className="modal-fundo" onClick={() => setConfirmarSaida(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <Nazza emote="chorando" tamanho="m" vertical />
            <h2>Já vai embora?</h2>
            <p>Se sair agora, o progresso desta lição se perde.</p>
            <button className="botao primario" onClick={() => setConfirmarSaida(false)}>Continuar estudando</button>
            <button className="botao texto-perigo" onClick={aoSair}>Sair da lição</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Ligar pares: toca um da esquerda e um da direita. Termina quando todos casarem.
function Pares({ q, config, bloqueado, aoTerminar }) {
  const esquerda = useMemo(() => embaralha(q.pares.map((p) => p[0])), [q])
  const direita = useMemo(() => embaralha(q.pares.map((p) => p[1])), [q])
  const [sel, setSel] = useState({ e: null, d: null })
  const [feitos, setFeitos] = useState([])
  const [errou, setErrou] = useState(null)
  const erros = useRef(0)

  function tocarItem(lado, valor) {
    if (bloqueado || feitos.includes(valor)) return
    const novo = { ...sel, [lado]: valor }
    tocar('toque', config)
    if (novo.e && novo.d) {
      const certo = q.pares.some(([a, b]) => a === novo.e && b === novo.d)
      if (certo) {
        const f = [...feitos, novo.e, novo.d]
        setFeitos(f)
        if (f.length === q.pares.length * 2) setTimeout(() => aoTerminar(erros.current === 0), 250)
      } else {
        erros.current++
        setErrou(novo)
        vibrar(60, config)
        setTimeout(() => setErrou(null), 450)
      }
      setSel({ e: null, d: null })
    } else setSel(novo)
  }

  const classe = (lado, v) =>
    'par' + (feitos.includes(v) ? ' feito' : '') + (sel[lado] === v ? ' marcada' : '') + (errou && errou[lado] === v ? ' errou' : '')

  return (
    <>
      <p className="enunciado">{q.enunciado}</p>
      <div className="pares">
        <div className="coluna">
          {esquerda.map((v) => <button key={v} className={classe('e', v)} onClick={() => tocarItem('e', v)}>{v}</button>)}
        </div>
        <div className="coluna">
          {direita.map((v) => <button key={v} className={classe('d', v)} onClick={() => tocarItem('d', v)}>{v}</button>)}
        </div>
      </div>
    </>
  )
}

function BarraTopo({ progresso, combo = 0, aoSair }) {
  return (
    <header className="barra-topo">
      <button className="icone-botao" onClick={aoSair} aria-label="Sair da lição"><Icone nome="X" size={24} /></button>
      <div className="progresso" role="progressbar" aria-valuenow={Math.round(progresso * 100)}>
        <div style={{ width: `${Math.max(progresso * 100, 3)}%` }} />
      </div>
      <span className={'combo' + (combo >= 3 ? ' ativo' : '')}><Icone nome="Flame" size={18} /> {combo}</span>
    </header>
  )
}

function Bloco({ cor, icone, rotulo, valor }) {
  return (
    <div className={`bloco cor-${cor}`}>
      <span className="bloco-rotulo"><Icone nome={icone} size={14} /> {rotulo}</span>
      <b>{valor}</b>
    </div>
  )
}
