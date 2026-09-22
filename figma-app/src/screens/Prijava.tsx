import { useState } from 'react'
import { type Korisnik, DEMO_NALOZI, ROLE_LABELS } from '../data'
import { C } from '../components/ui'
import { Ic } from '../components/Icons'

export default function Prijava({ onLogin }: { onLogin: (u: Korisnik) => void }) {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nalog = DEMO_NALOZI[email]
    if (!nalog || nalog.lozinka !== pass) {
      setError('Pogrešna email adresa ili lozinka.')
      return
    }
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin(nalog.korisnik) }, 700)
  }

  const demoNalozi = Object.entries(DEMO_NALOZI)

  return (
    <div className="min-h-screen flex" style={{ background: C.navy }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] p-12 relative overflow-hidden"
        style={{ background: `linear-gradient(155deg, ${C.navy} 0%, ${C.navy2} 60%, ${C.teal}22 100%)` }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 30% 70%, ${C.teal}22 0%, transparent 60%), radial-gradient(circle at 80% 20%, ${C.burgundy}18 0%, transparent 50%)` }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src={`${import.meta.env.BASE_URL}kapi-zivota-logo.png`} alt="Kapi Života" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <div className="text-white text-xl" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>Portal Zavoda</div>
              <div className="text-xs mt-0.5" style={{ color: C.teal3 }}>za transfuziju krvi</div>
            </div>
          </div>
          <h1 className="text-white text-4xl leading-tight mb-5" style={{ fontFamily: 'DM Serif Display, Georgia, serif' }}>
            Sigurno upravljanje zavodom na jednom mestu.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: C.ink3 }}>
            Integrisani informacioni sistem koji povezuje prijem donora, medicinsku službu, laboratoriju, redakciju i upravljanje zavodom.
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          {[{ n: '2.847', l: 'aktivnih donora' }, { n: '99.8%', l: 'dostupnost sistema' }, { n: '7', l: 'korisničkih uloga' }].map(({ n, l }) => (
            <div key={l} className="flex items-center gap-4">
              <div className="text-2xl font-medium" style={{ color: C.teal, fontFamily: 'JetBrains Mono, monospace' }}>{n}</div>
              <div className="text-sm" style={{ color: C.ink3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: C.s50 }}>
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <img src={`${import.meta.env.BASE_URL}kapi-zivota-logo.png`} alt="Kapi Života" className="w-9 h-9 rounded-lg object-cover" />
            <div className="text-xl" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>Portal Zavoda</div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border" style={{ borderColor: C.s200 }}>
            <h2 className="text-2xl mb-1" style={{ fontFamily: 'DM Serif Display, Georgia, serif', color: C.navy }}>Prijavite se</h2>
            <p className="text-sm mb-8" style={{ color: C.ink3 }}>Unesite vaše akreditive za pristup portalu</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Email adresa</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="vas.email@zavodbk.rs"
                  className="w-full h-11 px-4 rounded-lg border text-sm outline-none transition-all"
                  style={{ borderColor: C.s200, background: C.s50, color: C.ink9 }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.boxShadow = `0 0 0 3px ${C.teal}22` }}
                  onBlur={e => { e.currentTarget.style.borderColor = C.s200; e.currentTarget.style.boxShadow = 'none' }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: C.ink7 }}>Lozinka</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={pass}
                    onChange={e => { setPass(e.target.value); setError('') }} placeholder="••••••••"
                    className="w-full h-11 px-4 pr-11 rounded-lg border text-sm outline-none transition-all"
                    style={{ borderColor: error ? C.burgundy : C.s200, background: C.s50, color: C.ink9 }}
                    onFocus={e => { e.currentTarget.style.borderColor = error ? C.burgundy : C.teal; e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? C.burgundy : C.teal}22` }}
                    onBlur={e => { e.currentTarget.style.borderColor = error ? C.burgundy : C.s200; e.currentTarget.style.boxShadow = 'none' }} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity" style={{ color: C.ink5 }}>
                    <Ic.Eye />
                  </button>
                </div>
                {error && <p className="mt-1.5 text-xs" style={{ color: C.burgundy }}>{error}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="h-11 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: loading ? C.teal2 : C.teal, color: C.white }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Prijavljivanje...</>
                  : 'Prijavi se'}
              </button>
            </form>
          </div>

          {/* Demo nalozi */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: C.s200 }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: C.ink3 }}>Demo nalozi (lozinka: admin123)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoNalozi.map(([em, { korisnik }]) => (
                <button key={em} onClick={() => { setEmail(em); setPass('admin123'); setError('') }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all hover:border-teal-400"
                  style={{ borderColor: C.s200 }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: C.teal + '20', color: C.teal2 }}>
                    {korisnik.avatar}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium truncate" style={{ color: C.ink7 }}>{korisnik.ime}</div>
                    <div className="text-xs" style={{ color: C.ink3 }}>{ROLE_LABELS[korisnik.uloga]}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs" style={{ color: C.ink3 }}>
            © 2026 Zavod za transfuziju krvi Srbije
          </p>
        </div>
      </div>
    </div>
  )
}
