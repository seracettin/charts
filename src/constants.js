// Ubuntu brand colors (Vanilla Framework chart palette equivalents)
export const PALETTE = {
  orange:          '#E95420', // chart__bar--orange — Standard support
  orangeLight:     '#F29879', // chart__bar--orange-light
  aubergine:       '#77216F', // chart__bar--aubergine — Ubuntu Pro / ESM
  aubergineLight:  '#B39FB0', // chart__bar--aubergine-light — Legacy add-on
  purple:          '#983F9C',
  blue:            '#335280',
  teal:            '#19B6EE',
  green:           '#0E8420',
  warmGrey:        '#AEA79F',
  coolGrey:        '#333333'
}

export const PHASE = {
  STANDARD: { label: 'Standard support', color: PALETTE.orange },
  PRO:      { label: 'Ubuntu Pro (ESM)', color: PALETTE.aubergine },
  LEGACY:   { label: 'Legacy add-on',    color: PALETTE.aubergineLight },
  INTERIM:  { label: 'Interim release',  color: PALETTE.purple }
}
