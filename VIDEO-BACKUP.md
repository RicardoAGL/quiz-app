# Video Backup — Visual Faktory Course (M11 & M12)

## Status

| Module | Videos | Progress |
|--------|--------|----------|
| M11 Microeconomía | 146 Vimeo URLs | Partially downloaded (Mac M5, ~32/146) |
| M12 Macroeconomía | 93 Vimeo URLs  | Partially downloaded (Mac M5, ~16/93) |

Manifests are in Dropbox and sync to all machines automatically. Downloads can resume
from any machine at any time — yt-dlp skips already-completed files.

## Prerequisites

```bash
# Install yt-dlp:
brew install yt-dlp          # Mac
winget install yt-dlp        # Windows
pip install yt-dlp           # Linux / WSL
```

## Quick Start

The download script and manifests live in the shared Dropbox folder:

```
Dropbox/visualfaktory/
  download-videos.sh          ← cross-platform script
  Modulo 11 - .../videos/manifest.txt   ← 146 Vimeo URLs
  Modulo 12 - .../videos/manifest.txt   ← 93 Vimeo URLs
```

**Run from any machine** (script auto-detects Dropbox path on Mac / Linux / WSL):

```bash
cd ~/Library/CloudStorage/Dropbox/visualfaktory  # Mac
# or:
cd ~/Dropbox/visualfaktory                        # Linux / WSL

bash download-videos.sh all     # both modules
bash download-videos.sh m11     # M11 only
bash download-videos.sh m12     # M12 only
```

**Windows (PowerShell / without WSL)** — run yt-dlp directly:

```powershell
$DROPBOX = "$env:USERPROFILE\Dropbox\visualfaktory"
$M11 = "$DROPBOX\Modulo 11 - Principios de Microeconomia"
$M12 = "$DROPBOX\Modulo 12 - Principios de Macroeconomia"

# M11
yt-dlp -f "bestvideo[height<=720]+bestaudio/best" --merge-output-format mp4 `
  --no-overwrites --output "$M11\videos\%(title)s.%(ext)s" `
  --sleep-interval 1 --retries 3 `
  --batch-file "$M11\videos\manifest.txt"

# M12
yt-dlp -f "bestvideo[height<=720]+bestaudio/best" --merge-output-format mp4 `
  --no-overwrites --output "$M12\videos\%(title)s.%(ext)s" `
  --sleep-interval 1 --retries 3 `
  --batch-file "$M12\videos\manifest.txt"
```

## Storage Estimate

- ~146 × 30-60 MB (M11) + ~93 × 30-60 MB (M12) ≈ **7–15 GB total**
- Videos download directly from Vimeo — no Canvas login needed
- Manifests contain direct Vimeo URLs (`player.vimeo.com/video/{ID}`)

## Notes

- `--no-overwrites` makes it safe to restart at any time
- Output goes to `Modulo 11.../videos/` and `Modulo 12.../videos/` inside Dropbox
- Detailed notes: `Dropbox/visualfaktory/video-backup-notes.md`
