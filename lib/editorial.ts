import type { Product, Variant } from './types'

type Photograph = { file: string; alt: string; position?: string }
export const photo = (file: string) => `/collection/${file}.webp`

const editions: Record<string, { name: string; subtitle: string; photos: Photograph[] }> = {
  'amouage-opus-xiii-silver-oud': {
    name: 'Opus XIII · Silver Oud',
    subtitle: 'Un boisé ambré dense et sombre. À porter une première fois seul, pour laisser sa texture se déployer.',
    photos: [
      { file: 'silver-oud', alt: 'Flacon noir de Silver Oud devant son coffret', position: '40% 28%' },
      { file: 'hero', alt: 'Détail des flacons Silver Oud et Oud Ulya' },
      { file: 'amouage-details', alt: 'Silver Oud au premier plan de la collection Amouage' },
    ],
  },
  'amouage-interlude-53': {
    name: 'Interlude 53',
    subtitle: 'Un boisé épicé de caractère. À essayer sur peau et à retrouver quelques heures plus tard, quand le parfum s’est posé.',
    photos: [{ file: 'interlude-53', alt: 'Flacon bleu et doré d’Interlude 53' }],
  },
  'amouage-purpose-50': {
    name: 'Purpose 50',
    subtitle: 'Un boisé épicé aux contours affirmés. Comparez-le à Interlude 53, un jour différent, pour distinguer leurs deux écritures.',
    photos: [{ file: 'purpose-50', alt: 'Flacon vert profond de Purpose 50' }],
  },
  'amouage-jubilation-40': {
    name: 'Jubilation 40',
    subtitle: 'Le profil boisé chypré de la sélection Amouage. Une piste à suivre si vous cherchez un boisé d’un autre registre.',
    photos: [{ file: 'jubilation-40', alt: 'Gros plan sur le flacon doré de Jubilation 40', position: '28% 48%' }],
  },
  'amouage-decision': {
    name: 'Decision',
    subtitle: 'Un boisé aromatique au profil frais. Une autre façon d’aborder Amouage si vous aimez les compositions plus lumineuses.',
    photos: [{ file: 'decision', alt: 'Gros plan sur le flacon clair de Decision', position: '72% 48%' }],
  },
  'editions-de-parfums-frederic-malle-the-night': {
    name: 'The Night',
    subtitle: 'Boisé, ambré et floral, The Night est signé Dominique Ropion. Prenez le temps de le porter sur peau pour suivre son évolution.',
    photos: [
      { file: 'the-night', alt: 'Flacon The Night et son coffret doré', position: '66% 54%' },
      { file: 'the-night-coffret', alt: 'Détail du coffret doré de The Night' },
    ],
  },
}

export const featuredSlugs = [
  'amouage-interlude-53',
  'amouage-purpose-50',
  'amouage-opus-xiii-silver-oud',
  'editions-de-parfums-frederic-malle-the-night',
]

export function productName(p: Product) {
  return editions[p.slug]?.name ?? p.name
}

export function houseName(house: string) {
  if (/frederic malle/i.test(house)) return 'Frédéric Malle'
  if (house === house.toUpperCase()) {
    return house.toLocaleLowerCase('fr').replace(/(^|[ -])\p{L}/gu, value => value.toLocaleUpperCase('fr'))
  }
  return house
}

export function productPhotos(p: Product): Photograph[] {
  const photos = editions[p.slug]?.photos ?? []
  return p.image_url ? [{ file: p.image_url, alt: `Flacon ${productName(p)}` }, ...photos] : photos
}

export function photoSrc(p: Photograph) {
  return p.file.startsWith('/') || /^https?:\/\//i.test(p.file) ? p.file : photo(p.file)
}

export function productStory(p: Product) {
  return editions[p.slug]?.subtitle ?? (/^Décant de .+ par .+\.$/.test(p.description) ? '' : p.description)
}

export function variantName(v: Pick<Variant, 'ml' | 'refillable'>) {
  return `${v.ml} ml${v.refillable ? ' rechargeable' : ''}`
}

export const formatGuide = [
  { volume: '5 ml', title: 'Pour faire connaissance', text: 'Portez-le plusieurs fois sur peau. C’est aussi le format à choisir pour comparer plusieurs parfums.' },
  { volume: '10 ml', title: 'Pour y revenir', text: 'Gardez à portée de main une fragrance que vous aimez retrouver, au quotidien ou en déplacement.' },
  { volume: '10 ml rechargeable', title: 'Pour garder le vaporisateur', text: 'La même contenance, dans un vaporisateur que vous pourrez remplir à nouveau.' },
]
