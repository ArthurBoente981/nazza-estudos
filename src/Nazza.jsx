import {
  Bomb, BookCheck, BookOpen, BookOpenText, CalendarCheck, CalendarClock, ChartNoAxesColumn, Check,
  CheckCheck, ChevronRight, Circle, Clock, Construction, Crown, Database, Download,
  Dumbbell, Flame, Footprints, GraduationCap, Landmark, Lightbulb, Link2, ListChecks,
  Lock, Map, Medal, Palette, PenLine, Play, Repeat, RotateCcw,
  Scale, ScrollText, Settings, Smartphone, Star, Target, Timer, Trash2, Trophy,
  Upload, Users, Volume2, X, Zap,
} from 'lucide-react'

// Só os ícones usados no app (importar a biblioteca inteira pesa ~600 kB)
const Icones = { Bomb, BookCheck, BookOpen, BookOpenText, CalendarCheck, CalendarClock, ChartNoAxesColumn, Check, CheckCheck, ChevronRight, Circle, Clock, Construction, Crown, Database, Download, Dumbbell, Flame, Footprints, GraduationCap, Landmark, Lightbulb, Link2, ListChecks, Lock, Map, Medal, Palette, PenLine, Play, Repeat, RotateCcw, Scale, ScrollText, Settings, Smartphone, Star, Target, Timer, Trash2, Trophy, Upload, Users, Volume2, X, Zap }

const base = import.meta.env.BASE_URL

// Emote animado: respira parada, troca de expressão com "pop", pula no acerto e treme no erro.
// Mudar `reacaoId` dispara a reação de novo mesmo com o mesmo emote.
export function Nazza({ emote = 'feliz', reacao = null, reacaoId = 0, fala, tamanho = 'm', vertical = false }) {
  return (
    <div className={`nazza nazza-${tamanho}${vertical ? ' vertical' : ''}`}>
      <div className="nazza-corpo" key={reacao ? `${reacao}-${reacaoId}` : 'parada'} data-reacao={reacao || undefined}>
        <img key={emote} className="nazza-img" src={`${base}nazza/${emote}.webp`} alt="Nazzareh" draggable="false" />
        {reacao === 'pulo' && (
          <div className="brilhos" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
          </div>
        )}
      </div>
      {fala && <div className="balao" key={fala}>{fala}</div>}
    </div>
  )
}

// Vídeo em loop (acenando ou fazendo sinal de paz), num quadro roxo arredondado.
export function NazzaVideo({ nome = 'acenando', className = '' }) {
  return (
    <div className={'nazza-video ' + className}>
      <video autoPlay loop muted playsInline poster={`${base}nazza/${nome}.jpg`}>
        <source src={`${base}nazza/${nome}.webm`} type="video/webm" />
        <source src={`${base}nazza/${nome}.mp4`} type="video/mp4" />
      </video>
    </div>
  )
}

export function Icone({ nome, ...props }) {
  const C = Icones[nome] || Icones.Circle
  return <C strokeWidth={2.4} {...props} />
}

const CORES_CONFETE = ['#8b5cf6', '#ff7ab6', '#ffbf3c', '#3ccf7c', '#4aa8ff']

export function Confete() {
  return (
    <div className="confete" aria-hidden="true">
      {Array.from({ length: 48 }, (_, i) => (
        <span key={i} style={{
          left: `${Math.random() * 100}%`,
          background: CORES_CONFETE[i % CORES_CONFETE.length],
          animationDelay: `${Math.random() * 0.6}s`,
          animationDuration: `${2.2 + Math.random() * 1.6}s`,
          '--giro': `${Math.random() * 720 - 360}deg`,
          '--deriva': `${Math.random() * 120 - 60}px`,
        }} />
      ))}
    </div>
  )
}
