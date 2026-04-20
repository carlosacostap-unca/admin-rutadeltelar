const pad = (value: number) => String(value).padStart(2, '0');

export const formatGmtOffset = (date: Date) => {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `GMT${sign}${pad(hours)}:${pad(minutes)}`;
};

export const getBrowserTimeZoneLabel = (dateLike?: string | Date | null) => {
  const baseDate = dateLike
    ? typeof dateLike === 'string'
      ? new Date(dateLike)
      : dateLike
    : new Date();

  if (Number.isNaN(baseDate.getTime())) {
    return formatGmtOffset(new Date());
  }

  return formatGmtOffset(baseDate);
};

export const utcToLocalDateTimeInput = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const localDateTimeInputToUtc = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString();
};

export const formatUtcToBrowserLocale = (value?: string | null) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
};
