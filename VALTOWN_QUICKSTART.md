# Val Town Quick Deploy

## Deploy in 3 Minutes

This is the **fastest** way to get your Necromunda Tactical Auspex online.

### Step 1: Copy the Code

Open `valtown.tsx` in this repo and **copy everything** (Ctrl+A, Ctrl+C).

### Step 2: Create Val Town Account

1. Go to [val.town](https://www.val.town)
2. Sign up (free - use GitHub OAuth for instant signup)

### Step 3: Create Your Val

1. Click **"New Val"** (big blue button)
2. Select **"HTTP"** from the templates
3. **Delete** the example code
4. **Paste** the code from `valtown.tsx`
5. Name it something like `necromunda` or `tactical-auspex`
6. Click **"Save"** (or Cmd+S / Ctrl+S)

### Step 4: Get Your URL

Val Town automatically generates a URL like:

```
https://yourname-necromunda.web.val.run
```

**That's it!** Click the URL to open your live app.

---

## What You Get

✅ **Instant deployment** - No build, no config ✅ **HTTPS by default** - Secure
out of the box ✅ **Always online** - Val Town hosts it for you ✅ **No
maintenance** - Just works ✅ **Share easily** - Send link to gaming group

---

## Testing Your Deployment

1. **Open the URL** Val Town gave you
2. You should see the green CRT terminal screen
3. **Select a scenario** from dropdown
4. Click **"New Battle"** - map should generate
5. **Click units** to select and move them
6. **Test bomb mechanics** (Manufactorum Raid scenario)

If everything works, you're done! 🎉

---

## Sharing With Your Group

Just send them your Val Town URL:

```
Hey gang! I deployed our Necromunda tactical map:
https://yourname-necromunda.web.val.run

Try the Manufactorum Raid scenario!
```

---

## Free Tier Limits

Val Town free tier includes:

- **10 Vals** (you're using 1)
- **Unlimited HTTP requests**
- **Always on**

This is more than enough for a gaming group.

---

## Updating Your Deployment

Made changes locally? Easy update:

1. Open your Val on val.town
2. Copy new code from `valtown.tsx`
3. Paste and save
4. URL stays the same - updates instantly

---

## Troubleshooting

### "Import error" or "Module not found"

- Val Town uses Deno runtime
- Make sure you copied ALL of `valtown.tsx`
- Check there are no syntax errors

### Map doesn't load

- Open browser console (F12)
- Look for JavaScript errors
- Verify the Val is "Running" in Val Town dashboard

### Slow loading

- First load might be slow (cold start)
- Subsequent loads are fast
- Val Town caches at the edge

---

## Advanced: Custom Domain

Want `necromunda.yourdomain.com`?

1. Upgrade to Val Town Pro ($10/mo)
2. Go to your Val settings
3. Add custom domain
4. Update DNS with CNAME:
   ```
   CNAME necromunda yourname-necromunda.web.val.run
   ```

---

## Alternative: Use Original Files

Don't want Val Town? No problem!

You can deploy the original HTML/CSS/JS files to:

- **Netlify Drop** (drag & drop)
- **GitHub Pages** (free from repo)
- **Vercel** (auto-deploy from git)

See `DEPLOYMENT.md` for full guide.

---

## Why Val Town?

| Feature        | Val Town | GitHub Pages | Vercel |
| -------------- | -------- | ------------ | ------ |
| Setup time     | 3 min    | 10 min       | 5 min  |
| Build required | No       | No           | No     |
| Git required   | No       | Yes          | Yes    |
| Custom domain  | $10/mo   | Free         | Free   |
| HTTPS          | Auto     | Auto         | Auto   |
| Edge hosting   | Yes      | Via CDN      | Yes    |

Val Town = **Instant gratification** ⚡

---

## Support

- **Val Town Docs**: [docs.val.town](https://docs.val.town)
- **Val Town Discord**: Join for help
- **This Project**: See `README.md` for gameplay help

---

## What's Next?

Once deployed:

1. ✅ Test all 4 scenarios
2. ✅ Share with gaming group
3. ✅ Use during actual games
4. ✅ Provide feedback/suggestions
5. ✅ Customize scenarios (edit code)

---

**Pro Tip**: Bookmark your Val Town URL on mobile devices - the interface works
great on tablets during games!

🎲 **The Emperor Protects** 🎲
