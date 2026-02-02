const fs = require('fs');
const path = require('path');

// Cargar traducciones en memoria al iniciar
const localesDir = path.join(__dirname, '../locales');
const translations = {};

if (fs.existsSync(localesDir)) {
  fs.readdirSync(localesDir).forEach(file => {
    if (file.endsWith('.json')) {
      const lang = path.basename(file, '.json');
      try {
        translations[lang] = require(path.join(localesDir, file));
      } catch (err) {
        console.error(`Error cargando idioma ${lang}:`, err);
      }
    }
  });
}

const defaultLang = 'es';

module.exports = (req, res, next) => {
  // Detectar idioma: Query Param > Header > Default
  let lang = req.query.lang || req.headers['accept-language']?.split(',')[0].split('-')[0] || defaultLang;
  
  // Asegurar que el idioma existe, si no, usar default
  if (!translations[lang]) {
    lang = defaultLang;
  }

  req.language = lang;

  // Función helper para traducir
  // Uso: req.t('saludo') o req.t('errors.missing_field')
  req.t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        return key; // Fallback a la clave si no encuentra traducción
      }
    }
    
    return value;
  };

  next();
};
