export const translateProductName = (name: string, t: any, lng?: string) => {
  if (!name) return name;

  // Expected format from seed.js: "Noun Adj: Category" or "Noun Adj de Author: Category"
  const parts = name.split(': ');
  if (parts.length === 2) {
    const mainPart = parts[0]; // "Manual Esencial" or "Manual Esencial de Borges"
    const categoryPart = parts[1]; // "Ficción"
    
    const categoryTranslated = t(`DATA.CATEGORIES.${categoryPart}`, categoryPart);
    
    const mainParts = mainPart.split(' ');
    if (mainParts.length >= 2) {
      const noun = mainParts[0];
      const adj = mainParts[1];
      
      const nounTranslated = t(`DATA.NOUNS.${noun}`, noun);
      const adjTranslated = t(`DATA.ADJECTIVES.${adj}`, adj);
      
      let authorPart = '';
      if (mainParts.length > 2 && mainParts[2] === 'de') {
         const author = mainParts.slice(3).join(' ');
         authorPart = ` by ${author}`;
      }
      
      if (lng === 'en') {
        return `${adjTranslated} ${nounTranslated}${authorPart}: ${categoryTranslated}`;
      }
      
      return `${nounTranslated} ${adjTranslated}${authorPart}: ${categoryTranslated}`;
    }
  }

  return name;
};

export const translateProductDescription = (description: string, type: string, category: string, t: any) => {
  if (!description) return description;

  // Expected format from seed.js:
  // `Este ${type.toLowerCase()} ofrece una perspectiva única sobre ${category.toLowerCase()}. Ideal para aquellos que buscan profundizar su conocimiento con un enfoque ${adj.toLowerCase()}.`
  
  // We can try to extract the adjective from the end of the sentence.
  const words = description.split(' ');
  const lastWord = words[words.length - 1].replace('.', '');
  
  // Try to find the adjective in DATA.ADJECTIVES
  // In seed.js, the adj was one of the adjectives list.
  // We need to find which one it was. Since they are in Spanish in the DB, 
  // we look for the Spanish adj and translate it.
  
  // Actually, the description in DB is in Spanish.
  // We want to return the translated template.
  
  return t('DATA.DESCRIPTIONS.PRODUCT_DESC', {
    type: t(`DATA.TYPES.${type}`, type).toLowerCase(),
    category: t(`DATA.CATEGORIES.${category}`, category).toLowerCase(),
    adj: t(`DATA.ADJECTIVES.${lastWord}`, lastWord).toLowerCase()
  });
};
