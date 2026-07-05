export const normalizeSearchText = (value?: string | null) => {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const matchesSearchFields = (
  searchTerm: string,
  fields: Array<string | null | undefined>
) => {
  const normalizedSearch = normalizeSearchText(searchTerm);

  if (!normalizedSearch) {
    return true;
  }

  return fields.some((field) => normalizeSearchText(field).includes(normalizedSearch));
};
