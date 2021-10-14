export default function pad(valueToPadd: number, n: number) {
  return new Array(n).join('0').slice((n || 2) * -1) + valueToPadd;
}