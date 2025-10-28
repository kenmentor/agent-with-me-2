function getPlaceValue(amount: string | number): string {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return "";

  let range = "";
  switch (true) {
    case num < 1_000:
      range = "hundreds";
      break;
    case num < 10_000:
      range = "thousands";
      break;
    case num < 100_000:
      range = "tens of thousands";
      break;
    case num < 1_000_000:
      range = "hundreds of thousands";
      break;
    case num < 10_000_000:
      range = "millions";
      break;
    default:
      range = "tens of millions+";
  }

  const formatted =
    num >= 1_000_000
      ? `₦${Math.floor(Number((num / 1_000_000).toFixed(1)))}M`
      : num >= 1_000
      ? `₦${Math.floor(Number((num / 1_000).toFixed(1)))}K`
      : `₦${num}`;

  return `${formatted}`;
}
export default getPlaceValue;
