export function validateFirstName(firstName: string) {
  if (!firstName) throw new Error("First name is required");
  if (firstName.length < 2) throw new Error("First name is too short");
  if (firstName.length > 50) throw new Error("First name is too long");
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿÇç\s'-]+$/.test(firstName)) {
    throw new Error("First name contains invalid characters");
  }

  return firstName.trim();
}

export function validateLastName(lastName: string) {
  if (!lastName) throw new Error("Last name is required");
  if (lastName.length < 2) throw new Error("Last name is too short");
  if (lastName.length > 50) throw new Error("Last name is too long");
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿÇç\s'-]+$/.test(lastName)) {
    throw new Error("Last name contains invalid characters");
  }

  return lastName.trim();
}
