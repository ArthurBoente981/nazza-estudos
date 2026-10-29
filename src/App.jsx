import { useState } from 'react'
import Licao from './Licao.jsx'
import { secoes } from './trilha.js'
import { carregar, salvar, concluirLicao, diasParaProva, fezHoje } from './estado.js'

const DESLOCAMENTO = [0, 60, 90, 60, 0, -60, -90, -60] // zigue-zague da trilha

export default function App() {
  const [estado, setEstado] = useState(carregar)
  const [aberta, setAberta] = useState(null) // lição em andamento
  const [popup, setPopup] = useState(null)

  if (aberta) {
    return (
      <Licao licao={aberta} aoSair={() => setAberta(null)}
        aoConcluir={(xp, acertos, total) => {
          const novo = concluirLicao(estado, aberta.id, xp, acertos, total)
          setEstado(novo)
          salvar(novo)
          setAberta(null)
        }} />
    )
  }

  // Liberada = primeira lição com conteúdo ainda não feita, ou já feitas
  let n = 0
  let proximaMarcada = false

  return (
    <div className="home">
      <header className="topo">
        <span title="Ofensiva" className={fezHoje(estado) ? 'aceso' : ''}>🔥 {estado.ofensiva}</span>
        <span title="XP">⚡ {estado.xp}</span>
        <span title="Dias até a prova">📅 {diasParaProva(estado)}d</span>
      </header>

      {secoes.map((secao) => (
        <section key={secao.titulo}>
          {secao.unidades.map((u, ui) => (
            <div key={u.nome} className="unidade">
              <div className="faixa" style={{ background: ui === 0 ? secao.cor : '#3a3550' }}>
                <small>{secao.titulo} · Unidade {ui + 1}</small>
                <b>{u.nome}</b>
              </div>
              <div className="caminho">
                {ui === 0 && (
                  <img className="nazza-trilha" src={`${import.meta.env.BASE_URL}nazza/${fezHoje(estado) ? 'piscando' : 'feliz'}.webp`} alt="" />
                )}
                {u.licoes.map((l, li) => {
                  const desloc = DESLOCAMENTO[n++ % DESLOCAMENTO.length]
                  const feita = l && estado.feitas[l.id]
                  let tipo = 'trancada'
                  if (feita) tipo = 'feita'
                  else if (l && !proximaMarcada) {
                    tipo = 'atual'
                    proximaMarcada = true
                  }
                  return (
                    <button key={li} className={'no ' + tipo} style={{ transform: `translateX(${desloc}px)` }}
                      onClick={() => tipo !== 'trancada' && setPopup(l)}>
                      {tipo === 'feita' ? '✔' : tipo === 'atual' ? '★' : '🔒'}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="em-breve">Mais seções chegando: Conhecimentos Gerais, Informática e Específicos.</div>

      {popup && (
        <div className="popup-fundo" onClick={() => setPopup(null)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <small>{popup.unidade}</small>
            <b>{popup.titulo}</b>
            <span>{popup.questoes.length} questões{estado.feitas[popup.id] ? ` · melhor: ${estado.feitas[popup.id].melhor}%` : ''}</span>
            <button className="botao primario" onClick={() => { setAberta(popup); setPopup(null) }}>
              {estado.feitas[popup.id] ? 'Praticar de novo' : 'Começar'} +10 XP
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
