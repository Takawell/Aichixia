import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const A = '#0ea5e9';
const A2 = '#6366f1';

const BLACKLISTED_DOMAINS = [
  'wshu.net','mailinator.com','tempmail.com','guerrillamail.com','throwam.com',
  'sharklasers.com','guerrillamailblock.com','grr.la','guerrillamail.info',
  'guerrillamail.biz','guerrillamail.de','guerrillamail.net','guerrillamail.org',
  'spam4.me','trashmail.com','trashmail.me','trashmail.net','dispostable.com',
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
  'monemail.fr.nf','monmail.fr.nf','fakeinbox.com','mailnull.com','spamgourmet.com',
  'spamgourmet.net','spamgourmet.org','maildrop.cc','discard.email','spamhero.com',
  'tempinbox.com','tempinbox.co.uk','throwam.net','getairmail.com','filzmail.com',
  'spamfree24.org','spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net',
  'spamfree.eu','wegwerfmail.de','wegwerfmail.net','wegwerfmail.org',
  'mailnesia.com','mailnull.com','spamgourmet.com','trashmail.io','trashmail.at',
  'trashmail.xyz','trashmail.live','trashmail.win','trashmail.me','trashmail.com',
  'tempmail.ninja','tempmail.plus','tempmail.email','tempmail.de','tempmail.net',
  'temp-mail.org','temp-mail.io','temp-mail.ru','temp-mail.net','tempmailo.com',
  'tmailinator.com','tmail.io','tmail.com','getnada.com','nada.email',
  'inboxkitten.com','mohmal.com','throwam.com','throwam.net','throwam.me',
  'throwam.org','throwam.xyz','throwaway.email','throw.email',
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.de',
  '10minutemail.co.za','10minutemail.ru','10minutemail.be','10minutemail.cf',
  '10minemail.com','20minutemail.com','30minutemail.com','60minutemail.com',
  'minutemail.com','minuteinbox.com','mintemail.com','minmail.org',
  'fakeinbox.org','fakeinbox.net','fakeinbox.info','fakemailgenerator.com',
  'fakemail.fr','fakemail.net','fakeemailgenerator.com','fakeemailer.com',
  'mailbucket.org','mailcat.biz','mailcatch.com','mailchop.com','maildef.com',
  'mailexpire.com','mailfall.com','mailfence.com','mailfs.com','mailguard.me',
  'mailhazard.com','mailhazard.us','mailimate.com','mailin8r.com','mailinater.com',
  'mailinator2.com','mailinator.net','mailinator.org','mailinator.gq','mailinator.co',
  'mailinbox.co','mailinbox.net','mailink.net','mailismagic.com','mailjunk.cf',
  'mailkor.xyz','mailme.ir','mailme.lv','mailme.gq','mailmetrash.com',
  'mailmoat.com','mailnew.com','mailnull.net','mailnull.org','mailpick.biz',
  'mailproxsy.com','mailquack.com','mailrock.biz','mailseal.de','mailshell.com',
  'mailsiphon.com','mailslapping.com','mailslite.com','mailsmagic.com','mailsnull.com',
  'mailspam.me','mailspam.xyz','mailspam.life','mailsru.com','mailsucker.net',
  'mailsw.com','mailtag.com','mailtechx.com','mailtemp.info','mailtemp.net',
  'mailtemp.org','mailtemporaire.com','mailtemporaire.fr','mailthunder.com',
  'mailtome.de','mailtothis.com','mailtrash.net','mailtrix.net','mailtv.net',
  'mailtv.tv','mailzilla.com','mailzilla.org','maizzle.com','makemetheking.com',
  'manybrain.com','mbx.cc','mega.zik.dj','mezimages.net','mierdamail.com',
  'minsmail.com','moburl.com','moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  'mvrht.com','mxfuel.com','my10minutemail.com','mymail-in.net','mymailoasis.com',
  'mynetstore.de','mytemp.email','mytempemail.com','mytempmail.com',
  'netzidiot.de','nice-4u.com','noblepioneer.com','nobugmail.com',
  'noclickemail.com','nogmailspam.info','nomorespamemails.com','nonspam.eu',
  'nonspammer.de','noref.in','notsharingmy.info','nowhere.org','nowmymail.com',
  'nwldx.com','nwytg.net','objectmail.com','obobbo.com','odaymail.com',
  'odnorazovoe.ru','one-time.email','oneoffemail.com','oneoffmail.com',
  'onewaymail.com','online.ms','onqin.com','opentrash.com','ordinaryamerican.net',
  'otherinbox.com','owlpic.com','pookmail.com','poste.io','postinbox.com',
  'postpro.net','privy-mail.com','privy-mail.de','proxymail.eu','punkass.com',
  'put2.net','qq.com','quickinbox.com','rcpt.at','realemail.net',
  'receiveee.chickenkiller.com','recursor.net','regbypass.comsafe-mail.net',
  'rklips.com','rmqkr.net','rtrtr.com','s0ny.net','safe-mail.net',
  'safetymail.info','safetypost.de','sandboxmail.net','saynotospams.com',
  'selfdestructingmail.com','sendspamhere.com','sharklasers.com','shiftmail.com',
  'shitmail.me','shitmail.org','shitware.nl','skeefmail.com','slopsbox.com',
  'slushmail.com','smapfree24.com','smapfree24.de','smapfree24.eu',
  'smapfree24.info','smapfree24.org','smellfear.com','snakemail.com',
  'sneakemail.com','sneakmail.de','snkmail.com','sofimail.com','sofort-mail.de',
  'sogetthis.com','soodonims.com','spam.la','spamavert.com','spambox.info',
  'spambox.irishspringrealty.com','spambox.us','spamcannon.com','spamcannon.net',
  'spamcero.com','spamcon.org','spamcorptastic.com','spamcowboy.com',
  'spamcowboy.net','spamcowboy.org','spamday.com','spamex.com',
  'spamfree24.com','spamgoes.in','spamgourmet.net','spamgourmet.org',
  'spamherelots.com','spamhereplease.com','spamhole.com','spamify.com',
  'spaminator.de','spamkill.info','spaml.com','spaml.de','spammotel.com',
  'spammy.host','spamoff.de','spamslicer.com','spamspot.com','spamstack.net',
  'spamthis.co.uk','spamthisplease.com','spamtrail.com','spamtroll.net',
  'speed.1s.fr','spoofmail.de','squizzy.de','squizzy.eu','squizzy.net',
  'stinkefinger.net','stuffmail.de','super-auswahl.de','supergreatmail.com',
  'supermailer.jp','superrito.com','superstachel.de','suremail.info',
  'sweetxxx.de','tafmail.com','tagyourself.com','talkinator.com','tapchicoupon.com',
  'tbwt.com','techemail.com','techgroup.me','teewars.org','teleworm.com',
  'teleworm.us','temp-mail.com','temp.bartdevos.be','tempail.com','tempalias.com',
  'tempe-mail.com','tempemails.net','tempinbox.co.uk','tempm.com','tempmail2.com',
  'tempr.email','tempsky.com','tempthe.net','tempymail.com','thanksnospam.info',
  'thc.st','thedoghousemail.com','thelimestones.com','thichanthit.com',
  'throwamail.com','throwam.com','throwam.net','throwaway.email',
  'throya.com','tilien.com','tmail.com','tmailinator.com','toiea.com',
  'topranklist.de','torchmail.com','tradermail.info','trash-amil.com',
  'trash-mail.at','trash-mail.cf','trash-mail.ga','trash-mail.ml',
  'trash-me.com','trashdevil.com','trashdevil.de','trashemail.de',
  'trashimail.de','trashmail.app','trashmail.at','trashmail.com',
  'trashmail.gq','trashmail.io','trashmail.me','trashmail.net',
  'trashmail.org','trashmail.xyz','trashmailer.com','trashpanda.cc',
  'trashtigers.com','trbvm.com','trbvn.com','trbvo.com','trillianpro.com',
  'trshcn.com','turual.com','twinmail.de','tyldd.com','uggsrock.com',
  'umail.net','uroid.com','username.e4ward.com','venompen.com','veryrealemail.com',
  'vidchart.com','viditag.com','viewcastmedia.com','viewcastmedia.net',
  'viewcastmedia.org','viroleni.cu.cc','vkcode.ru','vomoto.com','vpn.st',
  'vsimcard.com','vubby.com','walala.org','walkmail.net','watchfull.net',
  'wbdet.com','webm4il.info','wegwerfmail.de','wegwerfmail.net','wegwerfmail.org',
  'wetrainbayarea.com','wetrainbayarea.org','wilemail.com','willhackforfood.biz',
  'willselfdestruct.com','wmail.cf','wolfsmail.tk','writeme.us','wronghead.com',
  'wuzupmail.net','www.e4ward.com','www.mailinator.com','xagloo.com',
  'xemaps.com','xents.com','xmaily.com','xoxy.net','xyzfree.net',
  'yapped.net','yeah.net','yep.it','yogamaven.com','yopmail.com',
  'yopmail.fr','yopmail.gq','you-spam.com','youmailr.com','ypmail.webredirect.org',
  'yuurok.com','z1p.biz','za.com','zehnminuten.de','zehnminutenmail.de',
  'zhouemail.510520.org','zippymail.info','zoemail.net','zoemail.org',
  'zomg.info','zxcv.com','zxcvbnm.com','zzz.com', 'web-library.net',
];

const SUSPICIOUS_USERNAME_PATTERNS: RegExp[] = [
  /^test\d*$/i,
  /^attacker/i,
  /^hacker/i,
  /^spam/i,
  /^fake/i,
  /^temp\d*$/i,
  /^tmp\d*$/i,
  /^disposable/i,
  /^trash/i,
  /^throwaway/i,
  /^burner/i,
  /^noname/i,
  /^nobody/i,
  /^noreply/i,
  /^no-reply/i,
  /^admin\d*$/i,
  /^root\d*$/i,
  /^user\d{4,}$/i,
  /^[a-z]{1,2}\d{6,}$/i,
  /^[a-z0-9]{30,}@/i,
  /^(qwerty|asdfgh|zxcvbn|qazwsx|12345|abcdef|aaaaa|bbbbb)/i,
  /^(null|undefined|void|delete|drop|select|insert|update)/i,
  /^x{3,}$/i,
  /^(.)\1{4,}/i,
];

const SUSPICIOUS_DOMAIN_PATTERNS: RegExp[] = [
  /^(temp|tmp|trash|spam|fake|junk|disposable|throwaway|burner|no-?reply|test)[.\-_]/i,
  /[.\-_](temp|tmp|trash|spam|fake|junk|mail\d+)(\.|$)/i,
  /\d{8,}/,
  /^[a-z]{1,3}\d{4,}\./i,
  /(mail|inbox|email)(er|inator|inator2|inator3)\./i,
  /^(yop|zap|zed|bim|bam|boo|foo|bar|baz|qux)[a-z]{0,3}\./i,
];

function validateEmail(email: string): { valid: boolean; reason?: string } {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed.includes('@') || trimmed.split('@').length !== 2) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  const [localPart, domain] = trimmed.split('@');

  if (!localPart || localPart.length < 2) {
    return { valid: false, reason: 'Email username is too short.' };
  }

  if (!domain || !domain.includes('.') || domain.length < 4) {
    return { valid: false, reason: 'Invalid email domain.' };
  }

  if (BLACKLISTED_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'This email domain is not allowed to register.' };
  }

  for (const pattern of SUSPICIOUS_DOMAIN_PATTERNS) {
    if (pattern.test(domain)) {
      return { valid: false, reason: 'Email domain detected as disposable or suspicious.' };
    }
  }

  for (const pattern of SUSPICIOUS_USERNAME_PATTERNS) {
    if (pattern.test(localPart) || pattern.test(trimmed)) {
      return { valid: false, reason: 'The email username was detected as suspicious. Please use your real email address.' };
    }
  }

  if (/[+]{1}/.test(localPart)) {
    return { valid: false, reason: 'Emails with "+" character are not allowed.' };
  }

  if (/\.{2,}/.test(trimmed) || /^\./.test(localPart) || /\.$/.test(localPart)) {
    return { valid: false, reason: 'Invalid email format.' };
  }

  if (localPart.length > 64 || domain.length > 253) {
    return { valid: false, reason: 'Email is too long.' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 10) {
    return { valid: false, reason: 'Invalid domain TLD.' };
  }

  if (/^\d+$/.test(tld)) {
    return { valid: false, reason: 'Invalid email domain.' };
  }

  return { valid: true };
}

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

function InputField({ type, value, onChange, placeholder, required, children, isError, dark, label }: {
  type: string; value: string; onChange: (v: string) => void;
  placeholder: string; required?: boolean; children?: React.ReactNode; isError?: boolean; dark: boolean; label: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="field-wrap">
      <label className="field-label" style={{ color: dark ? 'rgba(226,232,240,0.7)' : 'rgba(15,23,42,0.65)' }}>
        {label}
      </label>
      <div className="field-box" style={{
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
        border: `1.5px solid ${isError ? '#ef4444' : focused ? A : dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'}`,
        boxShadow: focused ? `0 0 0 4px ${dark ? 'rgba(14,165,233,0.14)' : 'rgba(14,165,233,0.1)'}` : 'none',
      }}>
        <input
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="field-input"
          style={{ color: dark ? '#f1f5f9' : '#0f172a' }}
        />
        {children}
      </div>
    </div>
  );
}

function PasswordStrength({ password, dark }: { password: string; dark: boolean }) {
  const getStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const strength = getStrength();
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#f87171', '#fb923c', '#fbbf24', '#4ade80', '#34d399'];
  if (!password) return null;
  return (
    <div style={{ marginTop: -6, marginBottom: 13 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : (dark ? 'rgba(255,255,255,0.09)' : '#e2e8f0'), transition: 'background 0.25s ease' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: colors[strength], fontWeight: 600, letterSpacing: '0.03em' }}>{labels[strength]}</span>
    </div>
  );
}

function PrimaryBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="primary-btn"
      style={{
        background: `linear-gradient(135deg,${A},${A2})`,
        boxShadow: hov && !loading ? `0 8px 24px rgba(14,165,233,0.38)` : `0 4px 16px rgba(14,165,233,0.28)`,
        transform: hov && !loading ? 'translateY(-1px)' : 'translateY(0)',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

function OAuthBtn({ onClick, loading, icon, label, dark }: { onClick: () => void; loading: boolean; icon: React.ReactNode; label: string; dark: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="oauth-btn"
      style={{
        color: dark ? '#e2e8f0' : '#334155',
        background: hov ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.035)') : (dark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.55)'),
        border: `1.5px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)'}`,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="12" cy="12" r="9" stroke={dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke={dark ? '#e2e8f0' : '#334155'} strokeWidth="3" strokeLinecap="round" />
          </svg>
        : icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={dark ? '#e2e8f0' : '#1f2328'}>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .31.21.66.8.55C20.71 21.39 24 17.08 24 12 24 5.65 18.85.5 12 .5z" />
    </svg>
  );
}

export default function Register() {
  const router = useRouter();
  const dark = useIsDark();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [shaking, setShaking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match'); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters'); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.reason ?? 'Invalid email.'); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    if (data?.user?.identities?.length === 0) {
      setError('An account with this email already exists'); setLoading(false);
      setShaking(true); setTimeout(() => setShaking(false), 650);
      return;
    }
    setSuccess('Account created! Please check your email to confirm your account.');
    setLoading(false);
  };

  const handleGithubSignup = async () => {
    setGithubLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/console` } });
    if (authError) { setError(authError.message); setGithubLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/console` } });
    if (authError) { setError(authError.message); setGoogleLoading(false); }
  };

  const sub = dark ? 'rgba(226,232,240,0.55)' : 'rgba(15,23,42,0.55)';
  const divider = dark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.08)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Inter',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes shake{0%,100%{transform:translateX(0);}15%{transform:translateX(-8px);}30%{transform:translateX(8px);}45%{transform:translateX(-5px);}60%{transform:translateX(5px);}75%{transform:translateX(-3px);}90%{transform:translateX(3px);}}
        @keyframes cardIn{from{opacity:0;transform:translateY(18px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes popIn{0%{opacity:0;transform:scale(0.9);}100%{opacity:1;transform:scale(1);}}
        @keyframes auroraDrift{0%,100%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(2%,-3%) rotate(6deg);}}
        @keyframes auroraDrift2{0%,100%{transform:translate(0,0) rotate(0deg);}50%{transform:translate(-3%,2%) rotate(-8deg);}}
        @keyframes slowSpin{to{transform:rotate(360deg);}}
        @keyframes slowSpinRev{to{transform:rotate(-360deg);}}
        @keyframes nodePulse{0%,100%{opacity:0.35;transform:scale(1);}50%{opacity:1;transform:scale(1.6);}}
        @keyframes dashFlow{to{stroke-dashoffset:-200;}}
        @keyframes floatSlow{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        @keyframes floatSlow2{0%,100%{transform:translateY(0);}50%{transform:translateY(12px);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .shake{animation:shake 0.6s cubic-bezier(0.36,0.07,0.19,0.97) both;}
        .pop-in{animation:popIn 0.3s cubic-bezier(0.4,0,0.2,1) both;}
        .login-card{animation:cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;}
        .left-copy{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both;position:relative;text-align:center;padding:0 48px;margin-top:210px;}
        .page-wrap{min-height:100vh;position:relative;display:flex;}
        .geo-panel{flex:0 0 48%;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .geo-rings{width:420px;height:420px;}
        .geo-net{width:440px;height:300px;top:14%;}
        .right-panel{flex:1 1 52%;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;}
        .form-card{position:relative;width:100%;max-width:400px;border-radius:24px;padding:40px 36px 32px;}
        .icon-badge{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:15px;margin-bottom:18px;}
        .h1-title{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px;}
        .head-block{text-align:center;margin-bottom:26px;}
        .theme-toggle-fixed{position:fixed;top:18px;right:20px;z-index:20;}
        .field-wrap{margin-bottom:16px;}
        .field-label{display:block;font-size:12.5px;font-weight:600;margin-bottom:7px;letter-spacing:0.01em;}
        .field-box{display:flex;align-items:center;gap:8px;border-radius:13px;padding:0 14px;height:46px;transition:border-color 0.18s ease,box-shadow 0.18s ease,background 0.3s ease;}
        .field-input{flex:1;height:100%;background:transparent;border:none;outline:none;font-size:14px;font-weight:500;font-family:'Inter',sans-serif;}
        .primary-btn{width:100%;height:46px;border-radius:13px;border:none;font-size:14px;font-weight:700;color:#fff;letter-spacing:0.01em;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s cubic-bezier(0.22,1,0.36,1);}
        .oauth-btn{width:100%;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;gap:9px;margin-bottom:10px;font-size:13.5px;font-weight:600;transition:all 0.18s ease;}
        input::placeholder{color:${dark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.32)'};}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-text-fill-color:inherit;transition:background-color 9999s ease-in-out 0s;}
        @media(max-width:900px){
          .page-wrap{flex-direction:column;}
          .geo-panel{flex:0 0 auto;width:100%;height:150px;border-right:none !important;border-bottom:1px solid rgba(148,163,184,0.14);}
          .geo-rings{width:260px;height:260px;}
          .geo-net{width:280px;height:190px;top:6%;}
          .left-copy{margin-top:0;padding:0 20px;}
          .left-copy h2{font-size:17px !important;margin-top:4px !important;}
          .left-copy p{display:none;}
          .right-panel{padding:20px 16px 36px;flex:1 1 auto;}
          .form-card{max-width:100%;padding:24px 20px 20px;border-radius:20px;}
          .icon-badge{width:36px;height:36px;border-radius:11px;margin-bottom:8px;}
          .h1-title{font-size:18px;margin-bottom:4px;}
          .head-block{margin-bottom:16px;}
          .theme-toggle-fixed{top:12px;right:12px;}
          .field-wrap{margin-bottom:12px;}
          .field-box{height:42px;}
          .oauth-btn{height:41px;margin-bottom:8px;}
        }
        @media(max-width:420px){
          .geo-panel{height:118px;}
          .geo-rings{width:200px;height:200px;}
          .geo-net{width:220px;height:150px;}
          .form-card{padding:20px 16px 16px;}
        }
      `}</style>

      <div className="page-wrap" style={{ background: dark ? '#05070d' : '#f4f8fc', transition: 'background 0.35s ease' }}>
        <div className="theme-toggle-fixed"><ThemeToggle /></div>

        <div className="geo-panel" style={{
          background: dark
            ? 'linear-gradient(160deg,#070b16 0%,#0a1730 55%,#050a14 100%)'
            : 'linear-gradient(160deg,#eef4fb 0%,#e3edf9 55%,#eef6f4 100%)',
          borderRight: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: dark
              ? 'radial-gradient(rgba(148,197,255,0.16) 1px,transparent 1.4px)'
              : 'radial-gradient(rgba(14,60,110,0.14) 1px,transparent 1.4px)',
            backgroundSize: '26px 26px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 45%,black 45%,transparent 92%)',
          }} />

          <div style={{
            position: 'absolute', width: 480, height: 480, borderRadius: '50%', top: '8%', left: '-12%',
            background: dark ? 'radial-gradient(circle,rgba(14,165,233,0.16),transparent 70%)' : 'radial-gradient(circle,rgba(14,165,233,0.12),transparent 70%)',
            filter: 'blur(20px)', animation: 'auroraDrift 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: 420, height: 420, borderRadius: '50%', bottom: '4%', right: '-10%',
            background: dark ? 'radial-gradient(circle,rgba(99,102,241,0.16),transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.1),transparent 70%)',
            filter: 'blur(20px)', animation: 'auroraDrift2 20s ease-in-out infinite',
          }} />

          <svg className="geo-rings" viewBox="0 0 420 420" style={{ position: 'absolute', opacity: dark ? 0.5 : 0.4 }}>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpin 40s linear infinite' }}>
              <circle cx="210" cy="210" r="168" fill="none" stroke={dark ? 'rgba(148,197,255,0.22)' : 'rgba(14,60,110,0.18)'} strokeWidth="1" strokeDasharray="2 10" strokeLinecap="round" />
            </g>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpinRev 55s linear infinite' }}>
              <circle cx="210" cy="210" r="128" fill="none" stroke={dark ? 'rgba(99,102,241,0.28)' : 'rgba(99,102,241,0.22)'} strokeWidth="1" strokeDasharray="1 7" strokeLinecap="round" />
            </g>
            <g style={{ transformOrigin: '210px 210px', animation: 'slowSpin 70s linear infinite' }}>
              <polygon points="210,80 320,150 320,270 210,340 100,270 100,150" fill="none" stroke={dark ? 'rgba(14,165,233,0.3)' : 'rgba(14,165,233,0.28)'} strokeWidth="1.2" />
            </g>
          </svg>

          <svg className="geo-net" viewBox="0 0 440 300" style={{ position: 'absolute', animation: 'floatSlow 7s ease-in-out infinite' }}>
            <line x1="60" y1="60" x2="220" y2="130" stroke={dark ? 'rgba(148,197,255,0.32)' : 'rgba(14,60,110,0.22)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 6s linear infinite' }} />
            <line x1="220" y1="130" x2="380" y2="70" stroke={dark ? 'rgba(99,102,241,0.32)' : 'rgba(99,102,241,0.24)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 8s linear infinite' }} />
            <line x1="220" y1="130" x2="240" y2="250" stroke={dark ? 'rgba(14,165,233,0.32)' : 'rgba(14,165,233,0.24)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 7s linear infinite' }} />
            <line x1="240" y1="250" x2="90" y2="220" stroke={dark ? 'rgba(148,197,255,0.24)' : 'rgba(14,60,110,0.18)'} strokeWidth="1.2" strokeDasharray="5 6" style={{ animation: 'dashFlow 9s linear infinite' }} />
            <circle cx="60" cy="60" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out infinite' }} />
            <circle cx="220" cy="130" r="6" fill={A2} style={{ animation: 'nodePulse 3s ease-in-out 0.4s infinite' }} />
            <circle cx="380" cy="70" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out 0.8s infinite' }} />
            <circle cx="240" cy="250" r="4.5" fill={A2} style={{ animation: 'nodePulse 3s ease-in-out 1.2s infinite' }} />
            <circle cx="90" cy="220" r="4.5" fill={A} style={{ animation: 'nodePulse 3s ease-in-out 1.6s infinite' }} />
          </svg>

          <div className="left-copy">
            <span style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', background: `linear-gradient(135deg,${A},${A2})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              aichixia.xyz
            </span>
            <h2 style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 27, fontWeight: 700, marginTop: 14,
              color: dark ? '#f1f5f9' : '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.25,
            }}>
              Join the network<br />of builders.
            </h2>
            <p style={{ fontSize: 13.5, color: dark ? 'rgba(226,232,240,0.5)' : 'rgba(15,23,42,0.5)', marginTop: 10, lineHeight: 1.6 }}>
              Create your account and start calling 20+ AI models through one unified API.
            </p>
          </div>
        </div>

        <div className="right-panel">
          <div
            ref={cardRef}
            className={`login-card form-card ${shaking ? 'shake' : ''}`}
            style={{
              background: dark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)'}`,
              boxShadow: dark
                ? '0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 24px 70px rgba(15,23,42,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            <div className="head-block">
              <div className="icon-badge" style={{
                background: `linear-gradient(135deg,${A},${A2})`,
                boxShadow: `0 8px 22px rgba(14,165,233,0.35)`,
              }}>
                <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                  <polygon points="16,3 29,26 3,26" stroke="white" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  <polygon points="16,10 24,24 8,24" fill="white" opacity="0.3" />
                </svg>
              </div>
              <h1 className="h1-title" style={{ color: dark ? '#f1f5f9' : '#0f172a' }}>Create your account</h1>
              <p style={{ fontSize: 13.5, color: sub, fontWeight: 500 }}>Start building with 20+ AI models</p>
            </div>

            {error && (
              <div className="pop-in" style={{
                marginBottom: 16, padding: '11px 14px', borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 9,
                background: dark ? 'rgba(248,113,113,0.1)' : '#fef2f2',
                border: `1px solid ${dark ? 'rgba(248,113,113,0.28)' : '#fecaca'}`,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" /><path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.45 }}>{error}</span>
              </div>
            )}

            {success && (
              <div className="pop-in" style={{
                marginBottom: 16, padding: '11px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 9,
                background: dark ? 'rgba(74,222,128,0.1)' : '#f0fdf4',
                border: `1px solid ${dark ? 'rgba(74,222,128,0.28)' : '#bbf7d0'}`,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.5" /><path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 12, color: dark ? '#4ade80' : '#16a34a' }}>{success}</span>
              </div>
            )}

            <OAuthBtn onClick={handleGoogleSignup} loading={googleLoading} icon={<GoogleIcon />} label="Sign up with Google" dark={dark} />
            <OAuthBtn onClick={handleGithubSignup} loading={githubLoading} icon={<GitHubIcon dark={dark} />} label="Sign up with GitHub" dark={dark} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 6 }}>
              <div style={{ flex: 1, height: 1, background: divider }} />
              <span style={{ fontSize: 11, color: sub, fontWeight: 600, letterSpacing: '0.05em' }}>OR SIGN UP WITH EMAIL</span>
              <div style={{ flex: 1, height: 1, background: divider }} />
            </div>

            <form onSubmit={handleRegister}>
              <InputField type="email" label="Email" value={email} onChange={setEmail} placeholder="you@example.com" required isError={!!error} dark={dark} />

              <InputField type={showPassword ? 'text' : 'password'} label="Password" value={password} onChange={setPassword} placeholder="Min. 6 characters" required isError={!!error} dark={dark}>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    display: 'flex', alignItems: 'center', color: dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)',
                    transition: 'color 0.18s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = A)}
                  onMouseOut={e => (e.currentTarget.style.color = dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)')}
                >
                  {showPassword
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </InputField>

              <PasswordStrength password={password} dark={dark} />

              <InputField
                type={showConfirmPassword ? 'text' : 'password'} label="Confirm password" value={confirmPassword} onChange={setConfirmPassword}
                placeholder="Re-enter your password" required
                isError={!!error || (confirmPassword.length > 0 && password !== confirmPassword)}
                dark={dark}
              >
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    display: 'flex', alignItems: 'center', color: dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)',
                    transition: 'color 0.18s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = A)}
                  onMouseOut={e => (e.currentTarget.style.color = dark ? 'rgba(226,232,240,0.4)' : 'rgba(15,23,42,0.35)')}
                >
                  {showConfirmPassword
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </InputField>

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p style={{ fontSize: 12, color: '#f87171', marginTop: -8, marginBottom: 12, paddingLeft: 2 }}>Passwords do not match</p>
              )}
              {confirmPassword.length > 0 && password === confirmPassword && confirmPassword.length >= 6 && (
                <p style={{ fontSize: 12, color: '#4ade80', marginTop: -8, marginBottom: 12, paddingLeft: 2 }}>✓ Passwords match</p>
              )}

              <PrimaryBtn loading={loading}>{loading ? 'Creating account...' : 'Create Account'}</PrimaryBtn>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: sub, marginTop: 18, fontWeight: 500 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: A, fontWeight: 700, textDecoration: 'none' }} onMouseOver={e => ((e.target as HTMLElement).style.textDecoration = 'underline')} onMouseOut={e => ((e.target as HTMLElement).style.textDecoration = 'none')}>
                Sign in
              </Link>
            </p>
            <p style={{ textAlign: 'center', fontSize: 11, color: dark ? 'rgba(226,232,240,0.32)' : 'rgba(15,23,42,0.32)', marginTop: 16, lineHeight: 1.7 }}>
              By creating an account, you agree to our{' '}
              <a href="/terms" style={{ color: A, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" style={{ color: A, textDecoration: 'none', fontWeight: 500 }} onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}>Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
