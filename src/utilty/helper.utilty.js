let codeCounter = 202000;
export const generateUniqueCode = () => codeCounter++;

export const calculateDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords2.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateAmount = (weight, distance) => {
  const ratePerKg = 5; 
  const ratePerKm = 1; 
  return weight * ratePerKg + distance * ratePerKm;
};

export const sendResponse = (res, { statusCode, success, message, data }) => {
  res.status(statusCode).json({
    statusCode,
    success,
    message,
    data,
  });
};