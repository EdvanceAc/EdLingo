# Test Supabase Connection
Write-Host "Testing Supabase connection..."

try {
    $headers = @{
        'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y25ydHBucXd3b29maHRreWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUyMzUsImV4cCI6MjA2NTM5MTIzNX0.ou9NatHQ16Tm_2YKHVIQOY9StJfUN08mla2QGud3ulk'
        'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y25ydHBucXd3b29maHRreWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTUyMzUsImV4cCI6MjA2NTM5MTIzNX0.ou9NatHQ16Tm_2YKHVIQOY9StJfUN08mla2QGud3ulk'
    }
    
    $response = Invoke-WebRequest -Uri 'https://hycnrtpnqwwoofhtkye.supabase.co/rest/v1/vocabulary?select=*' -Headers $headers
    
    Write-Host "✅ Success! Status Code: $($response.StatusCode)"
    Write-Host "📊 Response Content:"
    Write-Host $response.Content
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "🔍 Full Error Details:"
    Write-Host $_.Exception
}

Write-Host "Test completed."