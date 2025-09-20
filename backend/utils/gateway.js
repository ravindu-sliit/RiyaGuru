// Dummy gateway simulation
export const processCardPayment = async (cardDetails, amount) => {
  // Very basic validation
  if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiryDate || !cardDetails.cvv) {
    return { success: false, message: "Invalid card details" };
  }

  // Fake rule: if card number ends with even digit → success, else fail
  const lastDigit = parseInt(cardDetails.cardNumber.slice(-1));
  if (isNaN(lastDigit)) {
    return { success: false, message: "Invalid card number" };
  }

  if (lastDigit % 2 === 0) {
    return { success: true, transactionId: "TXN" + Date.now() };
  } else {
    return { success: false, message: "Payment declined by dummy gateway" };
  }
};
