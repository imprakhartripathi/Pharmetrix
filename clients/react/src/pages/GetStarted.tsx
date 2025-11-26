import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { usePageSEO } from '../hooks/usePageSEO'

const API_URL = (() => {
  const envUrl = (import.meta.env.PRIMARY_BACKEND_URL as string | undefined) ?? 'http://localhost:4200'
  if (typeof window === 'undefined') return envUrl
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  return isLocal ? envUrl : 'https://pharmetrix.onrender.com'
})()

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < breakpoint : false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return isMobile
}

type SignupResp = {
  message: string
  token: string
  user: { _id: string; email: string; fullName: string }
}

export default function GetStarted() {
  const isMobile = useIsMobile(768)
  const navigate = useNavigate()

  usePageSEO({
    title: "Sign Up & Get Started - Pharmetrix Pharmacy Management",
    description: "Create your Pharmetrix account in minutes. Manage your pharmacy's inventory, monitor cold-chain, process sales, and ensure compliance. Three simple steps: create account, verify email, and set up your organization.",
    keywords: "pharmacy software signup, create account, register pharmacy management system, pharmacy setup",
    ogUrl: "https://pharmetrix.onrender.com/get-started",
    canonical: "https://pharmetrix.onrender.com/get-started",
  });

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)

  // Step 0: Create Account
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 1: OTP
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 2: Organization
  const [orgName, setOrgName] = useState('')



  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [token, setToken] = useState<string | null>(null)

  // Helper: headers with auth
  const authHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token])

  useEffect(() => {
    let timer: number | undefined
    if (resendCooldown > 0) {
      timer = window.setTimeout(() => setResendCooldown((t) => t - 1), 1000)
    }
    return () => { if (timer) window.clearTimeout(timer) }
  }, [resendCooldown])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      const resp = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      })
      const data: SignupResp | { message?: string } = await resp.json()
      if (!resp.ok) throw new Error((data as any).message || 'Signup failed')

      const d = data as SignupResp
      setToken(d.token)

      // persist auth for protected routes
      localStorage.setItem('authToken', d.token)
      localStorage.setItem('authUser', JSON.stringify(d.user))

      setSuccess('Account created. Please verify your email.')

      // trigger OTP send automatically after signup
      await sendOtp()
      setStep(1)
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  async function sendOtp() {
    try {
      setError(null)
      const resp = await fetch(`${API_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.message || 'Failed to send OTP')
      setOtp('')
      setOtpSent(true)
      setResendCooldown(30)
      setSuccess('OTP sent to your email.')
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code.')
      return
    }
    try {
      setLoading(true)
      const resp = await fetch(`${API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otp })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.message || 'OTP verification failed')
      setSuccess('Email verified. Proceed to create your organization.')
      setStep(2)
    } catch (err: any) {
      setError(err?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!orgName) { setError('Organization name is required.'); return }
    if (!token) { setError('Missing auth token. Please sign up again.'); return }

    try {
      setLoading(true)
      const resp = await fetch(`${API_URL}/orgs`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name: orgName })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.message || 'Failed to create organization')
      setSuccess('Organization created successfully.')
      // After mandatory org creation, go to dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }



  const steps = [
    { key: 'account', label: 'Create Account' },
    { key: 'verify', label: 'Verify Email' },
    { key: 'org', label: 'Create Organization' },
    // { key: 'optional', label: 'Optional Details' },
  ] as const

  return (
    <main style={pageWrap} aria-labelledby="get-started-title" role="main">
      <div style={bgLayer} aria-hidden="true" />
      <div style={bgAccentLeft} aria-hidden="true" />
      <div style={bgAccentRight} aria-hidden="true" />

      <div style={{ ...contentWrap, ...(isMobile ? contentWrapMobile : null) }}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ ...promoPane, ...(isMobile ? promoPaneMobile : null) }}>
          <div style={logoTile}>
            <img src="/title-logo.png" alt="Pharmetrix" style={{ height: 36 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <motion.h1 id="get-started-title" style={{ ...promoTitle, ...(isMobile ? promoTitleMobile : null) }}>
            Get Started with Pharmetrix
          </motion.h1>
          <motion.p style={{ ...promoText, ...(isMobile ? { textAlign: 'center' } : null) }}>
            Create your account, verify your email, and set up your organization. You can skip non‑mandatory details and complete them later.
          </motion.p>

          <motion.ul variants={stagger} initial="hidden" animate="show" style={{ ...promoList, ...(isMobile ? promoListMobile : null) }}>
            {[ 'Account signup', 'Email verification via OTP', 'Mandatory organization setup', 'Optional profile details' ].map((item) => (
              <motion.li key={item} variants={fadeUp} style={{ ...promoListItem, ...(isMobile ? { justifyContent: 'center' } : null) }}>
                <span style={checkIcon}>✓</span>
                <span>{item}</span>
              </motion.li>
            ))}
          </motion.ul>

          <div style={{ marginTop: 16, color: '#fff', opacity: 0.9, textAlign: isMobile ? 'center' : 'left' }}>
            <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>Back to Home</Link>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ ...card, ...(isMobile ? cardMobile : null) }}>
          {/* Stepper */}
          <div style={stepperOuter}>
            <div style={stepRail} />
            <div style={{ ...stepRailDone, width: `${(steps.length > 1 ? (step / (steps.length - 1)) : 0) * 100}%` }} />
            <div style={stepperRow}>
              {steps.map((s, idx) => {
                const active = step === idx
                const done = step > idx
                return (
                  <div key={s.key} style={stepItem} aria-current={active ? 'step' : undefined}>
                    <div style={{ ...stepCircle, ...(done ? stepCircleDone : {}), ...(active ? stepCircleActive : {}) }}>{done ? '✓' : idx + 1}</div>
                    <div style={{ fontSize: 12, color: done || active ? 'var(--primary)' : 'var(--text)', textAlign: 'center' }}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div style={{ marginTop: '1rem' }}>
            {error && <div role="alert" style={alertError}>{error}</div>}
            {success && <div role="status" style={alertSuccess}>{success}</div>}
          </div>

          {step === 0 && (
            <motion.form variants={stagger} initial="hidden" animate="show" onSubmit={handleSignup} style={form}>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Full Name</span>
                <input type="text" placeholder="Jane Doe" required style={input} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </motion.label>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Email</span>
                <input type="email" placeholder="you@example.com" required style={input} value={email} onChange={(e) => setEmail(e.target.value)} />
              </motion.label>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Password</span>
                <input type="password" placeholder="••••••••" required style={input} value={password} onChange={(e) => setPassword(e.target.value)} />
              </motion.label>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Confirm Password</span>
                <input type="password" placeholder="••••••••" required style={input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </motion.label>
              <motion.button variants={fadeUp} type="submit" style={{ ...submitBtn, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }} disabled={loading}>Create Account</motion.button>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form variants={stagger} initial="hidden" animate="show" onSubmit={verifyOtp} style={form}>
              <motion.p variants={fadeUp} style={{ color: 'var(--text)' }}>We sent a 6‑digit code to <strong>{email}</strong>.</motion.p>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Verification Code</span>
                <input inputMode="numeric" pattern="[0-9]*" maxLength={6} placeholder="123456" required style={input} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
              </motion.label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <motion.button variants={fadeUp} type="submit" style={{ ...submitBtn, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }} disabled={loading}>Verify</motion.button>
                <button type="button" onClick={sendOtp} disabled={!otpSent ? false : resendCooldown > 0} style={{ ...resendBtn, opacity: resendCooldown > 0 ? 0.6 : 1 }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form variants={stagger} initial="hidden" animate="show" onSubmit={createOrganization} style={form}>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Organization Name</span>
                <input type="text" placeholder="My Pharmacy" required style={input} value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </motion.label>
              {/* Optional org details (not yet persisted by backend) */}
              <div style={{ fontSize: 12, color: '#6b7280' }}>You can add address and other details later in Settings.</div>
              <motion.button variants={fadeUp} type="submit" style={{ ...submitBtn, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }} disabled={loading}>Create Organization</motion.button>
            </motion.form>
          )}

          {/* {step === 3 && (
            <motion.form variants={stagger} initial="hidden" animate="show" onSubmit={saveOptionalProfile} style={form}>
              <motion.label variants={fadeUp} style={label}>
                <span style={labelText}>Contact Number (Optional)</span>
                <input type="tel" placeholder="+91 98765 43210" style={input} value={contact} onChange={(e) => setContact(e.target.value)} />
              </motion.label>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <motion.button variants={fadeUp} type="submit" style={{ ...submitBtn, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.8 : 1 }} disabled={loading}>Save & Finish</motion.button>
                <button type="button" onClick={() => navigate('/')} style={secondaryBtn}>Skip for now</button>
              </div>
            </motion.form>
          )} */}
        </motion.div>
      </div>
    </main>
  )
}

// Styles (reused from Auth page for visual continuity)
const pageWrap: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  display: 'grid',
  alignItems: 'center',
  background: 'linear-gradient(120deg, color-mix(in srgb, var(--secondary) 12%, transparent), color-mix(in srgb, var(--primary) 10%, transparent))',
}

const bgLayer: React.CSSProperties = { position: 'absolute', inset: 0, background: 'var(--bg)' }
const bgAccentLeft: React.CSSProperties = { position: 'absolute', left: '-10%', top: '-10%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(closest-side, color-mix(in srgb, var(--secondary) 22%, transparent), transparent 70%)' }
const bgAccentRight: React.CSSProperties = { position: 'absolute', right: '-5%', bottom: '-5%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)' }

const contentWrap: React.CSSProperties = { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', padding: '3rem 1rem', width: 'min(1200px, 100%)', margin: '0 auto' }
const contentWrapMobile: React.CSSProperties = { gridTemplateColumns: '1fr', gap: '1rem' }

const promoPane: React.CSSProperties = { color: '#fff', padding: '2rem', borderRadius: 16, background: 'linear-gradient(160deg, var(--primary), var(--primary-700))', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', border: '1px solid color-mix(in srgb, var(--primary) 30%, #ffffff)' }
const promoPaneMobile: React.CSSProperties = { textAlign: 'center' }
const logoTile: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 14, padding: '10px 12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', marginBottom: 16 }
const promoTitle: React.CSSProperties = { color: '#fff', fontSize: '2rem', lineHeight: 1.2 }
const promoTitleMobile: React.CSSProperties = { fontSize: '1.6rem' }
const promoText: React.CSSProperties = { marginTop: 8, color: 'rgba(255,255,255,0.9)' }
const promoList: React.CSSProperties = { listStyle: 'none', padding: 0, margin: '1rem 0 0', display: 'grid', gap: '.5rem' }
const promoListMobile: React.CSSProperties = { justifyItems: 'center' }
const promoListItem: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '.6rem' }
const checkIcon: React.CSSProperties = { display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 999, background: 'color-mix(in srgb, var(--secondary) 40%, #ffffff)', color: '#0b142a', fontWeight: 900 }

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: '1.25rem', alignSelf: 'center' }
const cardMobile: React.CSSProperties = { maxWidth: 600, width: '100%', margin: '0 auto' }

const form: React.CSSProperties = { display: 'grid', gap: '.85rem' }
const label: React.CSSProperties = { display: 'grid', gap: '.35rem' }
const labelText: React.CSSProperties = { color: 'var(--text)', fontWeight: 700 }
const input: React.CSSProperties = { padding: '.8rem 1rem', borderRadius: 12, background: '#ffffff', color: '#111827', border: '1px solid #e5e7eb', outline: 'none' }

const submitBtn: React.CSSProperties = { width: '100%', padding: '.9rem 1rem', borderRadius: 12, border: '1px solid var(--primary)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--primary) 92%, #ffffff), var(--primary-700))', color: '#fff', fontWeight: 800 }
const resendBtn: React.CSSProperties = { background: '#f3f4f6', color: '#111827', borderRadius: 12, padding: '.9rem 1rem', border: '1px solid #e5e7eb' }

const stepperOuter: React.CSSProperties = { position: 'relative', width: '100%', padding: '0 .5rem 1rem .5rem' }
const stepRail: React.CSSProperties = { position: 'absolute', left: 24, right: 24, top: 18, height: 2, background: 'var(--border)', borderRadius: 2, zIndex: 0 }
const stepRailDone: React.CSSProperties = { position: 'absolute', left: 24, top: 18, height: 2, background: 'var(--primary)', borderRadius: 2, transition: 'width .3s ease', zIndex: 0 }
const stepperRow: React.CSSProperties = { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'center', gap: '.5rem' }
const stepItem: React.CSSProperties = { display: 'grid', justifyItems: 'center', alignItems: 'center', gap: 6 }
const stepCircle: React.CSSProperties = { width: 36, height: 36, borderRadius: 999, display: 'grid', placeItems: 'center', border: '2px solid var(--border)', color: 'var(--text)', background: '#fff', fontWeight: 800 }
const stepCircleActive: React.CSSProperties = { borderColor: 'var(--primary)', color: 'var(--primary)' }
const stepCircleDone: React.CSSProperties = { borderColor: 'var(--primary)', background: 'var(--primary)', color: '#fff' }

const alertError: React.CSSProperties = { background: '#fee2e2', color: '#991b1b', padding: '.75rem 1rem', borderRadius: 12, border: '1px solid #fecaca', marginBottom: '.5rem' }
const alertSuccess: React.CSSProperties = { background: '#ecfdf5', color: '#065f46', padding: '.75rem 1rem', borderRadius: 12, border: '1px solid #a7f3d0', marginBottom: '.5rem' }