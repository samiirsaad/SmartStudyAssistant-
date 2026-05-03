$uri = "http://localhost:5000/api/study/upload"
$filePath = "c:\Users\a\SmartStudyAssistant\backend\uploads\1775876226034.pdf"

# Read file as bytes
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)

# Create form data
$boundary = [System.Guid]::NewGuid().ToString()
$body = New-Object System.IO.MemoryStream

# Write boundary
$bytes = [System.Text.Encoding]::UTF8.GetBytes("--$boundary`r`nContent-Disposition: form-data; name=`"pdf`"; filename=`"test.pdf`"`r`nContent-Type: application/pdf`r`n`r`n")
$body.Write($bytes, 0, $bytes.Length)

# Write file content
$body.Write($fileBytes, 0, $fileBytes.Length)

# Write closing boundary
$bytes = [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")
$body.Write($bytes, 0, $bytes.Length)

# Reset stream position
$body.Position = 0

# Make request
try {
    Write-Host "Uploading PDF file..."
    $response = Invoke-WebRequest -Uri $uri `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body.ToArray() `
        -TimeoutSec 120
    
    Write-Host "✅ Upload successful!"
    Write-Host "Response: $($response.Content)"
}
catch {
    Write-Host "❌ Upload failed!"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Response: $($_.Exception.Response | ConvertFrom-Json | ConvertTo-Json)"
    }
}
