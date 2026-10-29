import { useEffect, useState } from 'react'
import { ouvir, situacao, instalar, instrucoes } from './instalar.js'
import { Icone } from './Nazza.jsx'

// Faixa "Instale o app". Some quando já está instalado ou quando a pessoa dispensa.
export default function BotaoInstalar({ sempre = false }) {
  const [estado, setEstado] = useState(situacao)
  const [ajuda, setAjuda] = useState(false)
  const [dispensado, setDispensado] = useState(() => {
    try { return localStorage.getItem('nazza-instalar-dispensado') === '1' } catch { return false }
  })

  useEffect(() => ouvir(() => setEstado(situacao())), [])

  if (estado === 'instalado' || (dispensado && !sempre)) return null

  async function clicar() {
    if (estado === 'pode') await instalar()
    else setAjuda(true)
  }

  function dispensar() {
    setDispensado(true)
    try { localStorage.setItem('nazza-instalar-dispensado', '1') } catch { /* sem armazenamento */ }
  }

  return (
    <div className="instalar">
      <span className="instalar-icone"><Icone nome="Smartphone" size={22} /></span>
      <div className="instalar-texto">
        <b>Instale o app</b>
        <p>{ajuda || estado === 'navegador-interno' ? instrucoes[estado] || instrucoes.manual : 'Abre em tela cheia e funciona sem internet.'}</p>
      </div>
      {!ajuda && estado !== 'navegador-interno' && (
        <button className="botao primario pequeno" onClick={clicar}>Instalar</button>
      )}
      {!sempre && (
        <button className="icone-botao instalar-fechar" onClick={dispensar} aria-label="Dispensar"><Icone nome="X" size={18} /></button>
      )}
    </div>
  )
}
