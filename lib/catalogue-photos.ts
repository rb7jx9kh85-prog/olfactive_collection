export type Photograph = { file: string; alt: string; position?: string }

function gallery(slug: string, name: string, subjects: string[]): Photograph[] {
  return subjects.map((subject, index) => ({
    file: `parfums/${slug}-${index + 1}`,
    alt: `${subject} · ${name}`,
  }))
}

export const cataloguePhotos: Record<string, Photograph[]> = {
  'louis-vuitton-imagination': gallery('louis-vuitton-imagination', 'Imagination', ['Flacon', 'Flacon et décant', 'Flacon et coffret']),
  'louis-vuitton-pacific-chill': gallery('louis-vuitton-pacific-chill', 'Pacific Chill', ['Flacon', 'Flacon et décant', 'Flacon et coffret']),
  'acqua-di-parma-fico-di-amalfi': gallery('acqua-di-parma-fico-di-amalfi', 'Fico di Amalfi', ['Flacon', 'Flacon, coffret et décant']),
  'acqua-di-parma-colonia-essenza': gallery('acqua-di-parma-colonia-essenza', 'Colonia Essenza', ['Flacon', 'Flacon, coffret et décant']),
  'acqua-di-parma-arancia-di-capri-la-riserva': gallery('acqua-di-parma-arancia-di-capri-la-riserva', 'Arancia di Capri La Riserva', ['Flacon', 'Flacon, coffret et décant']),
  'acqua-di-parma-oud-spice': gallery('acqua-di-parma-oud-spice', 'Oud & Spice', ['Flacon', 'Flacon et coffret']),
  'acqua-di-parma-colonia': gallery('acqua-di-parma-colonia', 'Colonia', ['Flacon', 'Flacon, coffret et décant']),
  'editions-de-parfums-frederic-malle-the-night': gallery('editions-de-parfums-frederic-malle-the-night', 'The Night', ['Flacon', 'Flacon et décant']),
  'editions-de-parfums-frederic-malle-acne-studios': gallery('editions-de-parfums-frederic-malle-acne-studios', 'Acne Studios', ['Flacon', 'Flacon et décant']),
  'editions-de-parfums-frederic-malle-musc-ravageur': gallery('editions-de-parfums-frederic-malle-musc-ravageur', 'Musc Ravageur', ['Flacon', 'Flacon et décant']),
  'editions-de-parfums-frederic-malle-french-lover': gallery('editions-de-parfums-frederic-malle-french-lover', 'French Lover', ['Flacon', 'Flacon et décant']),
  'editions-de-parfums-frederic-malle-carnal-flower': gallery('editions-de-parfums-frederic-malle-carnal-flower', 'Carnal Flower', ['Flacon', 'Flacon et décant']),
  'acqua-di-parma-mirto-di-panarea': gallery('acqua-di-parma-mirto-di-panarea', 'Mirto di Panarea', ['Flacon', 'Flacon et décant', 'Flacon et coffret']),
  'amouage-purpose-50': gallery('amouage-purpose-50', 'Purpose 50', ['Flacon et décant', 'Flacon dans son coffret']),
  'amouage-interlude-53': gallery('amouage-interlude-53', 'Interlude 53', ['Flacon et décant', 'Flacon dans son coffret']),
  'amouage-jubilation-40': gallery('amouage-jubilation-40', 'Jubilation 40', ['Flacon', 'Flacon et décant']),
  'oman-luxury-royal-incense': gallery('oman-luxury-royal-incense', 'Royal Incense', ['Flacon', 'Flacon et décant']),
  'acqua-di-parma-zafferano': gallery('acqua-di-parma-zafferano', 'Zafferano', ['Flacon', 'Flacon et décant']),
  'acqua-di-parma-note-di-colonia-ii': gallery('acqua-di-parma-note-di-colonia-ii', 'Note di Colonia II', ['Flacon', 'Flacon et décant', 'Flacon dans son coffret']),
  'amouage-opus-xiii-silver-oud': gallery('amouage-opus-xiii-silver-oud', 'Silver Oud', ['Flacon et coffret']),
  'amouage-decision': gallery('amouage-decision', 'Decision', ['Flacon']),
  'amouage-reflection-45': gallery('amouage-reflection-45', 'Reflection 45', ['Flacon argenté', 'Vue de dessus du flacon']),
}
