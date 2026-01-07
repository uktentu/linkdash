#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Search LinkDash
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🔗
# @raycast.argument1 { "type": "text", "placeholder": "Query" }
# @raycast.packageName LinkDash

# Documentation:
# @raycast.description Search your LinkDash bookmarks
# @raycast.author Uday Kiran Tentu

open "https://uktentu.github.io/linkdash/?q=$1"
