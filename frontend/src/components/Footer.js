export default function Footer() {
  return (
    <footer style={{ 
      padding: '2rem', 
      textAlign: 'center', 
      borderTop: '1px solid rgba(255,255,255,0.1)', 
      marginTop: '4rem', 
      color: 'rgba(255,255,255,0.5)', 
      fontSize: '0.8rem',
      position: 'relative',
      zIndex: 100
    }}>
      <p>© {new Date().getFullYear()} GreenConstructAI. All rights reserved.</p>
    </footer>
  );
}
