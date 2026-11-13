// Labels voor opgeslagen databasewaarden. De opgeslagen waarde blijft ongewijzigd;
// alleen de weergave wordt vertaald. Onbekende waarden worden ongewijzigd getoond.
export const LEVELS = ["beginner", "intermediate", "advanced"]

export const levelLabel = (t, value) =>
  LEVELS.includes(value) ? t(`levels.${value}`) : (value ?? "")
