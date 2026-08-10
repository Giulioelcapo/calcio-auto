export function DataBadge({ usingMock }: { usingMock: boolean }) {
  // Niente badge “demo” pubblico; nascondi anche il badge tecnico live
  if (usingMock) return null;
  return null;
}
