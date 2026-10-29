import { useState } from 'react'
import { secoes } from '../trilha.js'
import { xpHoje } from '../estado.js'
import { Icone, NazzaVideo, Nazza } from '../Nazza.jsx'
import BotaoInstalar from '../BotaoInstalar.jsx'

const ZIGUE = [0, 44, 70, 44, 0, -44, -70, -44] // deslocamento horizontal dos nós (px)

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export default function Trilha({ estado, aoIniciar }) {
  const [popup, setPopup] = useState(null)
  const [guia, setGuia] = useState(null)

  // Marca qual é a próxima lição liberada (a primeira com conteúdo ainda não feita)
  let proxima = null
  for (const s of secoes) for (const u of s.unidades) for (const l of u.licoes)
    if (!proxima && l && !estado.feitas[l.id]) proxima = l

  const meta = estado.config.metaDiaria
  const feitoHoje = xpHoje(estado)
  let n = 0

  return (
    <div className="tela trilha">
      <BotaoInstalar />
      <section className="hero">
        <NazzaVideo nome="acenando" className="hero-video" />
        <div className="hero-texto">
          <span className="sobretitulo">{saudacao()}!</span>
          <h1>{feitoHoje >= meta ? 'Meta do dia batida 🎉' : proxima ? 'Bora estudar?' : 'Trilha em dia!'}</h1>
          <div className="meta">
            <div className="meta-barra"><div style={{ width: `${Math.min(100, (feitoHoje / meta) * 100)}%` }} /></div>
            <span>{Math.min(feitoHoje, meta)}/{meta} XP</span>
          </div>
          {proxima && (
            <button className="botao primario pequeno" onClick={() => aoIniciar(proxima)}>
              <Icone nome="Play" size={16} fill="currentColor" /> Continuar
            </button>
          )}
        </div>
      </section>

      {secoes.map((secao, si) => (
        <section key={secao.titulo}>
          <h2 className="secao-titulo">Seção {si + 1} · {secao.titulo}</h2>
          {secao.unidades.map((u, ui) => {
            const feitas = u.licoes.filter((l) => l && estado.feitas[l.id]).length
            const ativa = u.licoes.some(Boolean)
            return (
              <div key={u.nome} className="unidade">
                <div className={`faixa cor-${ativa ? u.cor : 'cinza'}`}>
                  <div>
                    <span className="faixa-sub">Unidade {ui + 1} · {feitas}/{u.licoes.length} lições</span>
                    <h3>{u.nome}</h3>
                  </div>
                  {ativa && (
                    <button className="faixa-guia" onClick={() => setGuia(u)} aria-label="Guia da unidade">
                      <Icone nome="BookOpenText" size={20} /> <span>Guia</span>
                    </button>
                  )}
                </div>

                <div className="caminho">
                  {ui === 0 && <div className="nazza-lado"><Nazza emote={estado.ultimoDia ? 'piscando' : 'feliz'} tamanho="p" /></div>}
                  {[...u.licoes, 'trofeu'].map((l, li) => {
                    const x = ZIGUE[n++ % ZIGUE.length]
                    if (l === 'trofeu') {
                      const ok = feitas === u.licoes.length
                      return (
                        <div key="t" className="no-wrap" style={{ '--x': `${x}px` }}>
                          <button className={'no trofeu' + (ok ? ' feita' : '')} disabled aria-label="Teste da unidade">
                            <Icone nome="Trophy" size={28} />
                          </button>
                        </div>
                      )
                    }
                    const feita = l && estado.feitas[l.id]
                    const tipo = feita ? 'feita' : l === proxima ? 'atual' : 'trancada'
                    return (
                      <div key={li} className="no-wrap" style={{ '--x': `${x}px` }}>
                        {tipo === 'atual' && <span className="balao-comecar">COMEÇAR</span>}
                        <button className={'no ' + tipo} disabled={tipo === 'trancada'} onClick={() => setPopup(l)}
                          aria-label={l ? l.titulo : 'Lição trancada'}>
                          <Icone nome={tipo === 'feita' ? 'Check' : tipo === 'atual' ? 'Star' : 'Lock'} size={tipo === 'trancada' ? 24 : 30}
                            fill={tipo === 'atual' ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      ))}

      <div className="em-breve">
        <Icone nome="Construction" size={22} />
        <p>Próximas seções: Conhecimentos Gerais, Informática e Específicos.</p>
      </div>

      {popup && (
        <div className="folha-fundo" onClick={() => setPopup(null)}>
          <div className="folha" onClick={(e) => e.stopPropagation()}>
            <span className="sobretitulo">{popup.unidade}</span>
            <h2>{popup.titulo}</h2>
            <div className="folha-info">
              <span><Icone nome="ListChecks" size={16} /> {popup.questoes.length} questões</span>
              {estado.feitas[popup.id] && <span><Icone nome="Target" size={16} /> melhor: {estado.feitas[popup.id].melhor}%</span>}
            </div>
            <button className="botao primario" onClick={() => { aoIniciar(popup); setPopup(null) }}>
              {estado.feitas[popup.id] ? 'Praticar de novo' : 'Começar'} · +10 XP
            </button>
          </div>
        </div>
      )}

      {guia && (
        <div className="folha-fundo" onClick={() => setGuia(null)}>
          <div className="folha guia" onClick={(e) => e.stopPropagation()}>
            <span className="sobretitulo">Guia da unidade</span>
            <h2>{guia.nome}</h2>
            {guia.licoes.filter(Boolean).map((l) => (
              <div key={l.id} className="guia-item">
                <h3>{l.titulo}</h3>
                <p>{l.dica}</p>
              </div>
            ))}
            <button className="botao secundario" onClick={() => setGuia(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}
