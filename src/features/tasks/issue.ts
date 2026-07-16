/** Detecta se o tipo de issue do Jira é um bug (cobre "Bug" e "Erro"). */
export function isBug(issueType: string): boolean {
  return /bug|erro/i.test(issueType);
}

/** Detecta se o tipo de issue do Jira é um épico (cobre "Epic" e "Épico"). */
export function isEpic(issueType: string): boolean {
  return /epic|épico/i.test(issueType);
}
