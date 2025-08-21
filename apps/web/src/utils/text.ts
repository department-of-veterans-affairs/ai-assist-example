export const formatSSN = (ssn: string) => {
  const cleaned = ssn.replace(/\D/g, '');
  return `***-**-${cleaned.slice(-4)}`;
};
