export const mockUsers = (length: number) => {
  const firstNames = ['Ida', 'Asep', 'Budi', 'Siti', 'Joko', 'Nina', 'Rina', 'Andi'];
  const lastNames = ['Purnama', 'Setiawan', 'Hidayat', 'Lestari', 'Saputra', 'Sari', 'Wati', 'Pratama'];

  const createRowData = (rowIndex: number) => {
    const firstName = firstNames[rowIndex % firstNames.length];
    const lastName = lastNames[rowIndex % lastNames.length];
    const gender = rowIndex % 2 === 0 ? 'Male' : 'Female';
    const age = 18 + (rowIndex % 20); // deterministic age between 18 and 37

    return {
      id: rowIndex + 1,
      firstName,
      lastName,
      gender,
      age
    };
  };

  return Array.from({ length }).map((_, index) => {
    return createRowData(index);
  });
};
