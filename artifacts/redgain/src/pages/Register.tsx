import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, ArrowLeft, User, Link2, ShieldCheck, CheckCircle2, Loader2, Phone, Wallet, Quote } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { useRegister } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth';

const COUNTRY_CODES = [
  // ── América Latina y El Caribe ──────────────────────────────────────────────
  { code: '+54', country: 'Argentina' },
  { code: '+591', country: 'Bolivia' },
  { code: '+55', country: 'Brasil' },
  { code: '+56', country: 'Chile' },
  { code: '+57', country: 'Colombia' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+53', country: 'Cuba' },
  { code: '+593', country: 'Ecuador' },
  { code: '+503', country: 'El Salvador' },
  { code: '+502', country: 'Guatemala' },
  { code: '+509', country: 'Haití' },
  { code: '+504', country: 'Honduras' },
  { code: '+52', country: 'México' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+507', country: 'Panamá' },
  { code: '+595', country: 'Paraguay' },
  { code: '+51', country: 'Perú' },
  { code: '+1-809', country: 'Rep. Dominicana' },
  { code: '+598', country: 'Uruguay' },
  { code: '+58', country: 'Venezuela' },
  // ── El Caribe ───────────────────────────────────────────────────────────────
  { code: '+1-268', country: 'Antigua y Barbuda' },
  { code: '+1-242', country: 'Bahamas' },
  { code: '+1-246', country: 'Barbados' },
  { code: '+501', country: 'Belice' },
  { code: '+1-441', country: 'Bermudas' },
  { code: '+599', country: 'Curazao' },
  { code: '+1-473', country: 'Granada' },
  { code: '+1-876', country: 'Jamaica' },
  { code: '+1-664', country: 'Montserrat' },
  { code: '+1-869', country: 'San Cristóbal y Nieves' },
  { code: '+1-758', country: 'Santa Lucía' },
  { code: '+1-784', country: 'San Vicente y las Granadinas' },
  { code: '+1-868', country: 'Trinidad y Tobago' },
  { code: '+1-649', country: 'Turcas y Caicos' },
  { code: '+1-340', country: 'Islas Vírgenes (EE.UU.)' },
  // ── América del Norte ───────────────────────────────────────────────────────
  { code: '+1', country: 'EE.UU. / Canadá' },
  // ── Europa ──────────────────────────────────────────────────────────────────
  { code: '+355', country: 'Albania' },
  { code: '+49', country: 'Alemania' },
  { code: '+376', country: 'Andorra' },
  { code: '+43', country: 'Austria' },
  { code: '+32', country: 'Bélgica' },
  { code: '+387', country: 'Bosnia y Herzegovina' },
  { code: '+359', country: 'Bulgaria' },
  { code: '+357', country: 'Chipre' },
  { code: '+385', country: 'Croacia' },
  { code: '+45', country: 'Dinamarca' },
  { code: '+421', country: 'Eslovaquia' },
  { code: '+386', country: 'Eslovenia' },
  { code: '+34', country: 'España' },
  { code: '+372', country: 'Estonia' },
  { code: '+358', country: 'Finlandia' },
  { code: '+33', country: 'Francia' },
  { code: '+30', country: 'Grecia' },
  { code: '+36', country: 'Hungría' },
  { code: '+354', country: 'Islandia' },
  { code: '+353', country: 'Irlanda' },
  { code: '+39', country: 'Italia' },
  { code: '+371', country: 'Letonia' },
  { code: '+423', country: 'Liechtenstein' },
  { code: '+370', country: 'Lituania' },
  { code: '+352', country: 'Luxemburgo' },
  { code: '+356', country: 'Malta' },
  { code: '+373', country: 'Moldavia' },
  { code: '+377', country: 'Mónaco' },
  { code: '+382', country: 'Montenegro' },
  { code: '+31', country: 'Países Bajos' },
  { code: '+48', country: 'Polonia' },
  { code: '+351', country: 'Portugal' },
  { code: '+44', country: 'Reino Unido' },
  { code: '+40', country: 'Rumania' },
  { code: '+7', country: 'Rusia' },
  { code: '+378', country: 'San Marino' },
  { code: '+381', country: 'Serbia' },
  { code: '+46', country: 'Suecia' },
  { code: '+41', country: 'Suiza' },
  { code: '+380', country: 'Ucrania' },
  { code: '+389', country: 'Macedonia del Norte' },
  { code: '+47', country: 'Noruega' },
  // ── África ──────────────────────────────────────────────────────────────────
  { code: '+213', country: 'Argelia' },
  { code: '+244', country: 'Angola' },
  { code: '+229', country: 'Benín' },
  { code: '+267', country: 'Botsuana' },
  { code: '+226', country: 'Burkina Faso' },
  { code: '+257', country: 'Burundi' },
  { code: '+238', country: 'Cabo Verde' },
  { code: '+237', country: 'Camerún' },
  { code: '+236', country: 'Rep. Centroafricana' },
  { code: '+269', country: 'Comoras' },
  { code: '+243', country: 'Rep. Dem. del Congo' },
  { code: '+242', country: 'Rep. del Congo' },
  { code: '+253', country: 'Yibuti' },
  { code: '+20', country: 'Egipto' },
  { code: '+240', country: 'Guinea Ecuatorial' },
  { code: '+291', country: 'Eritrea' },
  { code: '+251', country: 'Etiopía' },
  { code: '+241', country: 'Gabón' },
  { code: '+220', country: 'Gambia' },
  { code: '+233', country: 'Ghana' },
  { code: '+224', country: 'Guinea' },
  { code: '+245', country: 'Guinea-Bisáu' },
  { code: '+254', country: 'Kenia' },
  { code: '+266', country: 'Lesoto' },
  { code: '+231', country: 'Liberia' },
  { code: '+218', country: 'Libia' },
  { code: '+261', country: 'Madagascar' },
  { code: '+265', country: 'Malaui' },
  { code: '+223', country: 'Malí' },
  { code: '+222', country: 'Mauritania' },
  { code: '+230', country: 'Mauricio' },
  { code: '+212', country: 'Marruecos' },
  { code: '+258', country: 'Mozambique' },
  { code: '+264', country: 'Namibia' },
  { code: '+227', country: 'Níger' },
  { code: '+234', country: 'Nigeria' },
  { code: '+250', country: 'Ruanda' },
  { code: '+239', country: 'Santo Tomé y Príncipe' },
  { code: '+221', country: 'Senegal' },
  { code: '+232', country: 'Sierra Leona' },
  { code: '+252', country: 'Somalia' },
  { code: '+27', country: 'Sudáfrica' },
  { code: '+211', country: 'Sudán del Sur' },
  { code: '+249', country: 'Sudán' },
  { code: '+268', country: 'Suazilandia' },
  { code: '+255', country: 'Tanzania' },
  { code: '+228', country: 'Togo' },
  { code: '+216', country: 'Túnez' },
  { code: '+256', country: 'Uganda' },
  { code: '+260', country: 'Zambia' },
  { code: '+263', country: 'Zimbabue' },
  // ── Asia ────────────────────────────────────────────────────────────────────
  { code: '+93', country: 'Afganistán' },
  { code: '+966', country: 'Arabia Saudita' },
  { code: '+374', country: 'Armenia' },
  { code: '+994', country: 'Azerbaiyán' },
  { code: '+973', country: 'Baréin' },
  { code: '+880', country: 'Bangladés' },
  { code: '+95', country: 'Myanmar (Birmania)' },
  { code: '+975', country: 'Bután' },
  { code: '+673', country: 'Brunéi' },
  { code: '+855', country: 'Camboya' },
  { code: '+86', country: 'China' },
  { code: '+82', country: 'Corea del Sur' },
  { code: '+850', country: 'Corea del Norte' },
  { code: '+971', country: 'Emiratos Árabes Unidos' },
  { code: '+63', country: 'Filipinas' },
  { code: '+995', country: 'Georgia' },
  { code: '+91', country: 'India' },
  { code: '+62', country: 'Indonesia' },
  { code: '+964', country: 'Irak' },
  { code: '+98', country: 'Irán' },
  { code: '+972', country: 'Israel' },
  { code: '+81', country: 'Japón' },
  { code: '+962', country: 'Jordania' },
  { code: '+996', country: 'Kirguistán' },
  { code: '+965', country: 'Kuwait' },
  { code: '+856', country: 'Laos' },
  { code: '+961', country: 'Líbano' },
  { code: '+60', country: 'Malasia' },
  { code: '+977', country: 'Nepal' },
  { code: '+968', country: 'Omán' },
  { code: '+92', country: 'Pakistán' },
  { code: '+974', country: 'Catar' },
  { code: '+65', country: 'Singapur' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+66', country: 'Tailandia' },
  { code: '+90', country: 'Turquía' },
  { code: '+84', country: 'Vietnam' },
  // ── Oceanía ─────────────────────────────────────────────────────────────────
  { code: '+61', country: 'Australia' },
  { code: '+64', country: 'Nueva Zelanda' },
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', countryCode: '+55', phoneNumber: '', password: '', confirmPassword: '', referralCode: '', bscWallet: ''
  });
  const [errorMsg, setErrorMsg] = useState('');

  const registerMutation = useRegister();
  const { refetch } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMsg('El número de teléfono es requerido');
      return;
    }
    if (formData.bscWallet && !formData.bscWallet.match(/^0x[0-9a-fA-F]{40}$/)) {
      setErrorMsg('La dirección BSC debe empezar con 0x y tener 42 caracteres.');
      return;
    }
    const fullPhone = `${formData.countryCode}${formData.phoneNumber.trim()}`;
    registerMutation.mutate({
      data: {
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        password: formData.password,
        referralCode: formData.referralCode || null,
        bscWallet: formData.bscWallet || undefined
      }
    }, {
      onSuccess: async () => {
        await refetch();
        window.location.href = '/dashboard';
      },
      onError: (error: any) => {
        setErrorMsg(error?.response?.data?.error || error.message || 'Ocurrió un error al registrarse. Verifica tus datos.');
      }
    });
  };

  // Input class shared across all form fields
  const inputCls = "w-full pl-10 pr-4 h-12 rounded-xl bg-[#C9A227]/4 border border-[#C9A227]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/8 transition-all font-medium text-sm";

  return (
    <div className="min-h-screen w-full flex bg-[#0E0C09] relative overflow-hidden selection:bg-[#C9A227]/30">
      {/* Ambient warm glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8B6914]/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C9A227]/8 blur-[140px] pointer-events-none" />

      {/* ── Brand / Image Side ── */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden z-10">
        {/* Stoic background image */}
        <img
          src="/stoic-register.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.30) saturate(0.80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0E0C09]/10 to-[#0E0C09]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0C09]/50 via-transparent to-[#0E0C09]/70" />
        <div className="absolute inset-0 bg-[#2A1A00]/15 mix-blend-multiply" />
        {/* Gold vein right border */}
        <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C9A227]/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center items-start p-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md space-y-8 w-full"
          >
            <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black tracking-tight text-white hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-[#C9A227] rounded-xl flex items-center justify-center shadow-[0_0_20px_-5px_#C9A227]">
                <Logo className="w-7 h-7 text-black" />
              </div>
              RedGain
            </Link>

            <h3 className="text-4xl font-black text-white leading-tight">
              Deja de vivir de{' '}
              <span className="bg-gradient-to-r from-[#8B6914] via-[#C9A227] to-[#E8C547] bg-clip-text text-transparent">
                quincena en quincena.
              </span>
            </h3>

            <ul className="space-y-4 mt-4">
              {[
                'Ingresos recurrentes todos los meses',
                'Sin inversiones de riesgo ni promesas falsas',
                'Sistema de 3 niveles: $6/$2/$1 por referido',
                'Transparencia total en cada pago',
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-4 text-white/65 font-medium"
                >
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#E8C547]" />
                  </div>
                  <span className="text-lg leading-snug">{item}</span>
                </motion.li>
              ))}
            </ul>

            {/* Stoic quote */}
            <div className="border-l-2 border-[#C9A227]/50 pl-5 mt-6">
              <p className="text-white/55 italic text-sm leading-relaxed">
                "No desees que los eventos sean como tú quieres. Desea que sean como son, y encontrarás paz."
              </p>
              <p className="text-[#C9A227]/60 text-xs font-bold mt-2 uppercase tracking-wider">— Epicteto</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Form Side ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/40 hover:text-[#E8C547] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio
            </Link>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <Logo className="w-8 h-8 text-[#C9A227]" />
            <span className="font-black text-2xl text-white">RedGain</span>
          </div>

          {/* Stoic badge */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A227]/30 bg-[#C9A227]/8 text-[#E8C547] text-xs font-medium">
              <Quote className="w-3 h-3" />
              "La virtud es el único bien verdadero." — Marco Aurelio
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-black text-white">Únete hoy</h1>
            <p className="mt-2 text-white/50 font-medium">Crea tu cuenta y empieza a construir tu árbol de ingresos.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-white/70 font-bold text-sm block">Nombre completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><User className="h-5 w-5" /></div>
                <input id="name" type="text" placeholder="Tu nombre" value={formData.name} onChange={handleChange} className={inputCls} required />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-white/70 font-bold text-sm block">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><Mail className="h-5 w-5" /></div>
                <input id="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} className={inputCls} required />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-white/70 font-bold text-sm block">
                Número de WhatsApp <span className="text-[#E8C547]">(requerido)</span>
              </label>
              <div className="flex gap-2">
                <select
                  id="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="h-12 px-3 rounded-xl bg-[#C9A227]/4 border border-[#C9A227]/15 text-white focus:outline-none focus:border-[#C9A227]/50 text-sm font-medium shrink-0"
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={`${code}-${country}`} value={code} className="bg-[#0E0C09] text-white">{code} {country}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><Phone className="h-4 w-4" /></div>
                  <input id="phoneNumber" type="tel" placeholder="8899254399" value={formData.phoneNumber} onChange={handleChange}
                    className="w-full pl-9 pr-4 h-12 rounded-xl bg-[#C9A227]/4 border border-[#C9A227]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/8 transition-all font-medium text-sm" required />
                </div>
              </div>
              <p className="text-xs text-white/35 font-medium">Tu número se usará para contacto por WhatsApp.</p>
            </div>

            {/* BSC Wallet */}
            <div className="space-y-2">
              <label htmlFor="bscWallet" className="text-white/70 font-bold text-sm block">
                Billetera BSC BEP20 <span className="text-[#E8C547]">(para pagos automáticos)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                  <Wallet className="h-4 w-4" />
                </div>
                <input
                  id="bscWallet"
                  type="text"
                  placeholder="0x..."
                  value={formData.bscWallet}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 h-12 rounded-xl bg-[#C9A227]/4 border border-[#C9A227]/15 text-white placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/8 transition-all font-mono text-sm"
                />
              </div>
              <p className="text-xs text-white/35 font-medium">
                MetaMask, Trust Wallet, SafePal u otra wallet BSC. Puedes añadirla luego desde el Dashboard.
              </p>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="password" className="text-white/70 font-bold text-sm block">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><Lock className="h-5 w-5" /></div>
                  <input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className={inputCls} required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-white/70 font-bold text-sm block">Confirmar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><Lock className="h-5 w-5" /></div>
                  <input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className={inputCls} required />
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="space-y-2 pt-1">
              <label htmlFor="referralCode" className="text-white/70 font-bold text-sm block">Código de referido <span className="text-white/35 font-normal">(Opcional)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30"><Link2 className="h-5 w-5" /></div>
                <input id="referralCode" type="text" placeholder="Ej. A1B2C3D4" value={formData.referralCode} onChange={handleChange}
                  className="w-full pl-10 pr-4 h-12 rounded-xl bg-[#C9A227]/4 border border-[#C9A227]/15 text-[#E8C547] placeholder:text-white/25 focus:outline-none focus:border-[#C9A227]/50 focus:bg-[#C9A227]/8 transition-all font-mono font-bold uppercase tracking-wider text-sm" />
              </div>
              <p className="text-xs text-white/35 font-medium">Si alguien te invitó, ingresa su código aquí. El código debe pertenecer a una cuenta activa.</p>
            </div>

            {errorMsg && (
              <div className="text-red-400 text-sm font-bold text-center bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-14 text-base font-bold text-black bg-gradient-to-r from-[#8B6914] to-[#C9A227] hover:opacity-90 shadow-[0_0_30px_-5px_#C9A227] mt-2 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:hover:scale-100"
            >
              {registerMutation.isPending
                ? <Loader2 className="w-5 h-5 animate-spin text-black" />
                : <>Comenzar mi transformación <ArrowRight className="h-5 w-5" /></>
              }
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex justify-center text-sm font-medium text-white/40">
              ¿Ya eres miembro?{' '}
              <Link href="/login" className="ml-1 font-bold text-[#E8C547] hover:text-[#C9A227] transition-colors">Inicia sesión</Link>
            </div>
            <Link href="/como-funciona" className="text-xs text-white/25 hover:text-[#E8C547]/60 transition-colors underline">
              ¿Cómo funciona el sistema?
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/30 text-center">
              <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0" />
              <span>Al unirte, aceptas que tu tiempo y tu futuro valen más.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
