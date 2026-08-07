import { FaFacebook, FaInstagram, FaTelegram, FaTiktok, FaPhone, FaEnvelope } from 'react-icons/fa6';
import './App.css';

function Footer({ restaurant }) {
  if (!restaurant) return null;

  const { contactPhone, contactEmail, socialLinks } = restaurant;
  const hasContactInfo = contactPhone || contactEmail;
  const hasSocials = socialLinks && Object.values(socialLinks).some(link => link.trim() !== '');

  if (!hasContactInfo && !hasSocials) return null;

  return (
    <footer style={{
      marginTop: '48px',
      padding: '32px 20px',
      background: 'var(--brand-color)',
      textAlign: 'center',
      color: '#ffffff',
      borderRadius: '24px 24px 0 0'
    }}>
      <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '600' }}>Get in Touch</h3>
      
      {hasContactInfo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {contactPhone && (
            <a href={`tel:${contactPhone}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FaPhone size={16} /> {contactPhone}
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FaEnvelope size={16} /> {contactEmail}
            </a>
          )}
        </div>
      )}

      {hasSocials && (
        <div>
          <h4 style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Follow Us</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="social-icon" style={{ color: '#ffffff' }}>
                <FaFacebook size={26} />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="social-icon" style={{ color: '#ffffff' }}>
                <FaInstagram size={26} />
              </a>
            )}
            {socialLinks.telegram && (
              <a href={socialLinks.telegram} target="_blank" rel="noreferrer" className="social-icon" style={{ color: '#ffffff' }}>
                <FaTelegram size={26} />
              </a>
            )}
            {socialLinks.tiktok && (
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="social-icon" style={{ color: '#ffffff' }}>
                <FaTiktok size={26} />
              </a>
            )}
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '32px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
        Powered by Digital Menu SaaS
      </div>
    </footer>
  );
}

export default Footer;
