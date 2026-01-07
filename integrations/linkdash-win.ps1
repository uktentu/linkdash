# Add this function to your PowerShell profile (usually $PROFILE)

function ld {
    param([string]$query)
    Start-Process "https://uktentu.github.io/linkdash/?q=$query"
}

# Usage:
# ld "react docs"
