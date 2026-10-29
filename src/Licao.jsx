import { useMemo, useState } from 'react'

const ACERTO = ['rindo', 'gargalhando', 'piscando', 'apaixonada', 'confiante']
const ERRO = ['chorando', 'nervosa', 'surpresa', 'brava']
const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)]

function embaralha(lista) {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function Nazza({ emote, fala, grande }) {
  return (
    <div className={'nazza-fala' + (grande ? ' grande' : '')}>
      <img src={`${import.meta.env.BASE_URL}nazza/${emote}.webp`} alt="Nazzareh" />
      {fala && <div className="balao">{fala}</div>}
    </div>
  )
}

function textoResposta(q) {
  if (q.tipo === 'mc') return q.opcoes[q.correta]
  if (q.tipo === 'ce') return q.correta ? 'Certo' : 'Errado'
  return q.correta
}

export default function Licao({ licao, aoSair, aoConcluir }) {
  // Fila de questões: as erradas voltam pro fim, como no Duolingo
  const [fila, setFila] = useState(() => licao.questoes.map((q, i) => ({ ...q, idx: i })))
  const [mostrandoDica, setMostrandoDica] = useState(true)
  const [escolha, setEscolha] = useState(null)
  const [resultado, setResultado] = useState(null) // null | 'certo' | 'errado'
  const [acertadas, setAcertadas] = useState(new Set())
  const [erradasAlgumaVez, setErradasAlgumaVez] = useState(new Set())
  const [emote, setEmote] = useState('feliz')
  const [fim, setFim] = useState(false)

  const total = licao.questoes.length
  const q = fila[0]
  const bancoEmbaralhado = useMemo(() => (q && q.tipo === 'lacuna' ? embaralha(q.banco) : []), [q])

  if (mostrandoDica) {
    return (
      <div className="licao">
        <BarraTopo progresso={0} aoSair={aoSair} />
        <div className="corpo dica">
          <h2>{licao.titulo}</h2>
          <Nazza emote="confiante" fala={licao.dica} grande />
        </div>
        <div className="rodape">
          <button className="botao primario" onClick={() => setMostrandoDica(false)}>Bora!</button>
        </div>
      </div>
    )
  }

  if (fim) {
    const deCara = total - erradasAlgumaVez.size
    const xp = 10 + deCara
    const perfeito = deCara === total
    return (
      <div className="licao">
        <div className="corpo fim">
          <Nazza emote={perfeito ? 'apaixonada' : 'gargalhando'} grande
            fala={perfeito ? 'Gabaritou! Tá pronta pra posse, hein? 😍' : 'Lição concluída! Os erros eu vou te cobrar de novo depois 😉'} />
          <div className="placar">
            <div className="caixa xp"><span>XP</span><b>+{xp}</b></div>
            <div className="caixa acerto"><span>De primeira</span><b>{Math.round((deCara / total) * 100)}%</b></div>
          </div>
        </div>
        <div className="rodape">
          <button className="botao primario" onClick={() => aoConcluir(xp, deCara, total)}>Continuar</button>
        </div>
      </div>
    )
  }

  const respondida = resultado !== null
  const podeVerificar = escolha !== null && !respondida

  function verificar() {
    const certo =
      q.tipo === 'mc' ? escolha === q.correta :
      q.tipo === 'ce' ? escolha === q.correta :
      escolha === q.correta
    setResultado(certo ? 'certo' : 'errado')
    setEmote(sorteia(certo ? ACERTO : ERRO))
    if (certo) {
      setAcertadas(new Set(acertadas).add(q.idx))
    } else {
      setErradasAlgumaVez(new Set(erradasAlgumaVez).add(q.idx))
      if (navigator.vibrate) navigator.vibrate(120)
    }
  }

  function proxima() {
    const resto = fila.slice(1)
    const novaFila = resultado === 'errado' ? [...resto, q] : resto
    setEscolha(null)
    setResultado(null)
    if (novaFila.length === 0) setFim(true)
    else setFila(novaFila)
  }

  return (
    <div className="licao">
      <BarraTopo progresso={acertadas.size / total} aoSair={aoSair} />
      <div className="corpo">
        {erradasAlgumaVez.has(q.idx) && !respondida && <div className="selo-revisao">↺ Erro anterior</div>}
        <Nazza emote={respondida ? emote : 'pensativa'}
          fala={q.tipo === 'ce' ? 'Certo ou errado?' : q.tipo === 'lacuna' ? 'Completa a lei pra mim:' : 'Escolhe a certa:'} />

        {q.tipo === 'mc' && (
          <>
            <p className="enunciado">{q.enunciado}</p>
            <div className="opcoes">
              {q.opcoes.map((op, i) => (
                <button key={i} disabled={respondida}
                  className={'opcao' + (escolha === i ? ' marcada' : '') + (respondida && i === q.correta ? ' gabarito' : '') + (respondida && escolha === i && i !== q.correta ? ' errada' : '')}
                  onClick={() => setEscolha(i)}>
                  <span className="letra">{'ABCDE'[i]}</span>{op}
                </button>
              ))}
            </div>
          </>
        )}

        {q.tipo === 'ce' && (
          <>
            <p className="enunciado">{q.enunciado}</p>
            <div className="ce">
              {[true, false].map((v) => (
                <button key={String(v)} disabled={respondida}
                  className={'opcao ce-' + (v ? 'certo' : 'errado') + (escolha === v ? ' marcada' : '') +
                    (respondida && v === q.correta ? ' gabarito' : '') + (respondida && escolha === v && v !== q.correta ? ' errada' : '')}
                  onClick={() => setEscolha(v)}>
                  {v ? '✔ Certo' : '✘ Errado'}
                </button>
              ))}
            </div>
          </>
        )}

        {q.tipo === 'lacuna' && (
          <>
            <p className="enunciado lacuna">
              {q.texto.split('___')[0]}
              <span className={'buraco' + (escolha ? ' preenchido' : '')} onClick={() => !respondida && setEscolha(null)}>
                {escolha || ' '}
              </span>
              {q.texto.split('___')[1]}
            </p>
            <div className="banco">
              {bancoEmbaralhado.map((p) => (
                <button key={p} disabled={respondida || escolha === p}
                  className={'ficha' + (escolha === p ? ' usada' : '')} onClick={() => setEscolha(p)}>
                  {p}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={'rodape' + (respondida ? ' ' + resultado : '')}>
        {respondida && (
          <div className="feedback">
            <b>{resultado === 'certo' ? 'Mandou bem!' : 'Resposta: ' + textoResposta(q)}</b>
            <p>{q.explicacao}</p>
            <span className="artigo">📜 Lei 8.112 · {q.artigo}</span>
          </div>
        )}
        {respondida ? (
          <button className={'botao ' + (resultado === 'certo' ? 'primario' : 'perigo')} onClick={proxima}>Continuar</button>
        ) : (
          <button className="botao primario" disabled={!podeVerificar} onClick={verificar}>Verificar</button>
        )}
      </div>
    </div>
  )
}

function BarraTopo({ progresso, aoSair }) {
  return (
    <div className="barra-topo">
      <button className="fechar" onClick={aoSair} aria-label="Sair">✕</button>
      <div className="progresso"><div style={{ width: `${progresso * 100}%` }} /></div>
    </div>
  )
}
