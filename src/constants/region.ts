export const REGIONS = ["ams", "fra", "gru", "hkg", "iad", "syd"] as const;

export const regions: Record<string, string> = {
  ams: "Amsterdam",
  fra: "Frankfurt",
  gru: "Sao Paulo",
  hkg: "Hong Kong",
  iad: "Washington D.C.",
  syd: "Sydney",
};
