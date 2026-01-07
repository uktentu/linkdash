# Add this to your ~/.zshrc or ~/.bashrc

# 1. 'ld' command: Opens browser with query
# Usage: ld "my query"
ld() {
  open "https://uktentu.github.io/linkdash/?q=$*"
}

# 2. 'ld' short alias (if you prefer no function)
# alias ld='open https://uktentu.github.io/linkdash/?q='
