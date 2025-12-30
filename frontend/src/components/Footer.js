import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2024 Cagnotte App. Tous droits réservés.</p>
        <div className="footer-links">
          <a href="/about">À propos</a>
          <a href="/contact">Contact</a>
          <a href="/terms">Conditions d'utilisation</a>
          <a href="/privacy">Politique de confidentialité</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

