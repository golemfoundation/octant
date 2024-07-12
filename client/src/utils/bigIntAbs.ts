export default function bigintAbs(n: bigint): bigint {
  return n < 0n ? -n : n;
}
