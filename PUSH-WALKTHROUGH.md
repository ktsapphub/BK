# Step-by-step: make the repo private, then push the fixes

Written for someone who hasn't used a terminal before. Do these in order.
Nothing here can break your code — the edits are already saved to your files.
Git is just recording them and sending them to GitHub.

---

## Part 1 — Make the repo private (browser, 1 minute)

1. Go to **https://github.com/ktsapphub/BK**
2. Click **Settings** (top row of the repo, gear icon, far right)
3. Scroll all the way to the bottom — red-outlined box labeled **Danger Zone**
4. Find **Change repository visibility** → click **Change visibility**
5. Choose **Make private** → click through the warnings
6. It asks you to type `ktsapphub/BK` to confirm → type it → confirm

Done. Nobody can see the repo now except you.

---

## Part 2 — Open PowerShell in the right folder

1. Open **File Explorer**
2. Navigate to `Documents` → `GitHub` → `BK`
   (or paste `C:\Users\keyto\OneDrive\Documents\GitHub\BK` into the address bar
   and press Enter)
3. Click once in the **address bar** at the top so the path highlights blue
4. Type `powershell` over it and press **Enter**

A blue-black window opens. The last line should end with `...\GitHub\BK>`.
That's your prompt — it means PowerShell is "standing inside" your project
folder. If it doesn't say `BK` at the end, close it and redo step 3.

**How to use it:** copy a command below, click into the black window,
right-click (that pastes), press Enter. Right-click *is* paste here —
Ctrl+V often doesn't work.

---

## Part 3 — Run these, one at a time

Run each block, press Enter, wait for the prompt to come back before the next.

### Step 1 — Clear the stuck lock file

```powershell
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
```

Nothing prints. That's correct — this cleans up after a command of mine that
got interrupted.

### Step 2 — Stop tracking the Emergent folder and the Python cache

```powershell
git rm -r --cached .emergent
git rm -r --cached backend/__pycache__
```

Prints a list of `rm '.emergent/...'` lines. `--cached` means "stop tracking
in git" — it does not delete anything from your computer yet.

If you see *"did not match any files"*, that's fine, it just means it wasn't
tracked. Move on.

### Step 3 — Delete the Emergent folder for real

```powershell
Remove-Item -Recurse -Force .emergent
```

Nothing prints. The folder is gone from your machine.

### Step 4 — Tell git to ignore Python cache from now on

```powershell
Add-Content .gitignore "`n__pycache__/`n*.pyc"
```

Nothing prints. This stops those files coming back.

### Step 5 — Check what's about to be committed

```powershell
git status --short
```

**This is the important one — read the output.** You should see roughly:

```
 M backend/requirements.txt
 M backend/server.py
 M backend/storage_utils.py
 M frontend/package.json
 M .gitignore
?? backend/runtime.txt
 D .emergent/...            (several of these)
 D backend/__pycache__/...  (several of these)
```

`M` = modified, `?? ` = new file, `D` = deleted. All of those are expected.

⚠️ **If you instead see 100+ files listed**, stop and tell me. It means the
line-ending setting didn't stick and we'd be committing noise.

### Step 6 — Stage everything

```powershell
git add -A
```

Nothing prints. "Staging" means marking these changes to be included.

### Step 7 — Commit

```powershell
git commit -m "Remove Emergent platform dependencies for self-hosted deployment"
```

Prints something like `12 files changed, 45 insertions(+), 380 deletions(-)`.
A commit is a saved checkpoint on your computer. Still not on GitHub yet.

### Step 8 — Push to GitHub

```powershell
git push
```

**A browser window or popup may open asking you to sign in to GitHub.** That's
normal and expected the first time — sign in and authorize. Then run `git push`
again if it didn't continue on its own.

Success looks like:

```
To https://github.com/ktsapphub/BK.git
   a1b2c3d..e4f5g6h  main -> main
```

---

## Done

Refresh https://github.com/ktsapphub/BK in your browser. You should see your
commit message at the top, and the `.emergent` folder should be gone.

---

## If something goes wrong

**Nothing you can type here will destroy your work.** The edits live in your
files; git is only recording them.

- **Red text you don't understand** → copy the whole thing and paste it to me.
- **`fatal: not a git repository`** → PowerShell isn't in the right folder.
  Redo Part 2.
- **`Please tell me who you are`** → run:
  ```powershell
  git config user.email "mydatejar@gmail.com"
  git config user.name "MDJ"
  ```
  then retry the commit.
- **`updates were rejected`** → someone/something changed the repo on GitHub.
  Run `git pull --rebase` then `git push`. Send me the output if it complains.
- **Window closes accidentally** → nothing is lost, just redo Part 2 and
  continue from where you stopped.

---

## What's next after this

Deploying to Railway — that's a website, not a terminal, and I'll walk you
through it the same way. See `DE-EMERGENT-AND-DEPLOY.md` for the env vars
you'll need.
