# Testa il token football-data SENZA pubblicarlo.
# Uso: apri PowerShell, vai nella cartella del progetto, poi:
#   .\scripts\test-football-token.ps1

Write-Host ""
Write-Host "Incolla il token football-data e premi Invio:" -ForegroundColor Cyan
$secure = Read-Host -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
$token = $token.Trim()

if (-not $token) {
  Write-Host "Nessun token inserito." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host ("Lunghezza: {0}" -f $token.Length)
Write-Host ("Inizia con sk_ ? {0}" -f ($token.StartsWith("sk_")))

try {
  $res = Invoke-WebRequest -Uri "https://api.football-data.org/v4/competitions/SA" -Headers @{ "X-Auth-Token" = $token } -UseBasicParsing
  Write-Host ""
  Write-Host ("RISULTATO: OK status={0}" -f [int]$res.StatusCode) -ForegroundColor Green
  Write-Host "Questo token e' buono. Mettilo su Vercel e fai Redeploy."
} catch {
  $code = $null
  if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
  Write-Host ""
  Write-Host ("RISULTATO: ERRORE status={0}" -f $code) -ForegroundColor Red
  if ($code -eq 403) {
    Write-Host "Token rifiutato/disabilitato. Devi registrare un account NUOVO su football-data.org"
    Write-Host "con email diversa (es. tuaemail+calcio7@gmail.com) e usare quel token."
  } elseif ($code -eq 400) {
    Write-Host "Token malformato. Ricopia tutta la riga dopo 'Your API token:'"
  } else {
    Write-Host $_.Exception.Message
  }
}
