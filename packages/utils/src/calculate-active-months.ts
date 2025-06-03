export const calculateActiveMonths = (createdAt: string, numberOfBadMonths: number) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(createdAt).getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths - numberOfBadMonths;
  };