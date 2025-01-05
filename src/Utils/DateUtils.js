export const getYear = date => {
  return new Date(formatDateToISO(date, true)).getFullYear();
};

export const formatDateToISO = (humanReadableDate, includeTime = false) => {
  if (!humanReadableDate) return null;

  const [datePart, timePart] = humanReadableDate.split(" - "); // Split into "DD/MM/YYYY" and "HH:mm" parts
  const [day, month, year] = datePart.split("/"); // Split the date into day, month, year

  // Format date as "YYYY-MM-DD"
  let formattedDate = `${year}-${month}-${day}`;

  // If includeTime is true and timePart exists, append the time
  if (includeTime && timePart) {
    formattedDate += `T${timePart}`; // Append time in ISO format (HH:mm:ss)
  }

  return formattedDate; // Return the formatted date and time
};

export const formatFriendlyDate = isoDateString => {
  if (!isoDateString) return "Unknown Date";
  const date = new Date(isoDateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric", // Use "numeric" to remove the leading zero
    month: "long",
    year: "numeric",
  }).format(date);
};
