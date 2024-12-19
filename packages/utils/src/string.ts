export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeEachWord(string: string) {
  return string.split(" ").map(capitalize).join(" ");
}
