# Deployment Guide

## Val Town Deployment (Easiest)

Val Town allows you to deploy this as a single HTTP handler.

### Steps:

1. **Sign up at [val.town](https://www.val.town)**

2. **Create a new HTTP Val**
   - Click "New Val" → "HTTP"

3. **Copy the contents of `valtown.tsx`**
   - The entire file is a self-contained handler
   - Everything is inlined (HTML, CSS, JavaScript)

4. **Paste into Val Town editor**

5. **Click "Save" and get your URL**
   - Val Town will give you a URL like: `https://username-valname.web.val.run`

6. **Done!** Your app is live.

### Val Town Features:
- ✅ Instant deployment
- ✅ HTTPS by default
- ✅ No configuration needed
- ✅ Free tier available
- ✅ Custom domain support (paid)

## Deno Deploy (Fast & Free)

Deno Deploy is optimized for TypeScript and perfect for this project.

### Steps:

1. **Install Deno** (if running locally):
   ```bash
   # Windows (PowerShell)
   irm https://deno.land/install.ps1 | iex

   # macOS/Linux
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Test locally**:
   ```bash
   deno task dev
   # Opens on http://localhost:8000
   ```

3. **Deploy to Deno Deploy**:

   **Option A: GitHub Integration**
   - Push your code to GitHub
   - Go to [dash.deno.com](https://dash.deno.com)
   - Click "New Project"
   - Connect your GitHub repo
   - Set entry point: `server.ts`
   - Deploy!

   **Option B: CLI Deployment**
   ```bash
   # Install deployctl
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

   # Deploy
   deployctl deploy --project=necromunda server.ts
   ```

### Deno Deploy Features:
- ✅ 1 million requests/month free
- ✅ Edge network (fast worldwide)
- ✅ Auto HTTPS
- ✅ TypeScript native
- ✅ GitHub integration

## Static Hosting (Traditional)

Host the original HTML/CSS/JS files anywhere.

### Suitable Services:
- **Netlify Drop**: Drag & drop folder
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Free hosting from repo
- **Cloudflare Pages**: Fast edge hosting
- **Surge**: CLI-based deployment

### Files to Deploy:
```
necromunda_terminal_map/
├── index.html
├── styles.css
├── app.js
├── scenarios.js
└── (optional) README.md
```

### Example: Netlify Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the 4 files (HTML, CSS, 2x JS)
3. Get instant URL
4. Done!

### Example: GitHub Pages

1. Create repo named `necromunda-auspex`
2. Push files to `main` branch
3. Go to Settings → Pages
4. Set source to `main` branch, root folder
5. Get URL: `https://username.github.io/necromunda-auspex`

## Docker (Self-Hosted)

Run your own container with Deno.

### Dockerfile:
```dockerfile
FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache server.ts

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-read", "server.ts"]
```

### Build and Run:
```bash
docker build -t necromunda-auspex .
docker run -p 8000:8000 necromunda-auspex
```

## Environment Variables

No environment variables required! Everything runs client-side.

## Custom Domain

### Val Town (Paid):
- Go to Val settings
- Add custom domain
- Update DNS CNAME

### Deno Deploy:
- Project settings → Domains
- Add domain
- Configure DNS

### Static Hosts:
- Most provide custom domain in settings
- Update DNS to point to their servers

## Performance Tips

### For Val Town/Deno:
- Already optimized
- Uses HTTP/2 by default
- Edge caching automatic

### For Static Hosting:
1. **Enable Compression**: gzip/brotli (usually automatic)
2. **Set Cache Headers**: CSS/JS can be cached long-term
3. **Use CDN**: Cloudflare or similar

## Monitoring

### Check if deployed correctly:
1. Open URL in browser
2. Should see green CRT terminal
3. Click "New Battle" - map should generate
4. Open browser console (F12) - no errors

### Common Issues:

**"mapSystem is not defined"**
- Files not loading in correct order
- Check that `scenarios.js` loads before `app.js`

**"SCENARIOS is not defined"**
- `scenarios.js` not loading
- Check file path in HTML

**Map doesn't generate**
- JavaScript error - check console
- Check `window.onload` event fired

**Styles look wrong**
- CSS not loading
- Check `styles.css` path
- Clear browser cache

## Cost Comparison

| Platform | Free Tier | Custom Domain | Build Time |
|----------|-----------|---------------|------------|
| **Val Town** | 10 vals | Paid plan | Instant |
| **Deno Deploy** | 1M req/mo | Free | < 1 min |
| **Netlify** | 100 GB/mo | Free | < 1 min |
| **Vercel** | Unlimited | Free | 1-2 min |
| **GitHub Pages** | 1 GB storage | Free | 2-5 min |
| **Surge** | Unlimited | Paid | Instant |

## Recommended: Val Town

For the easiest deployment with zero configuration:

1. Copy `valtown.tsx` contents
2. Paste into Val Town HTTP handler
3. Save
4. Share your link!

**Your URL**: `https://username-necromunda.web.val.run`

---

## Next Steps After Deployment

1. **Share the link** with your gaming group
2. **Test all scenarios** to verify functionality
3. **Bookmark** for easy access during games
4. **Mobile test** - works on tablets/phones
5. **Customize** scenarios in the code if needed

## Troubleshooting Deployment

### Val Town Issues:
- Check handler exports `default function`
- Verify it returns `Response` object
- Check Val Town console for errors

### Deno Deploy Issues:
- Ensure `server.ts` is in project root
- Check file permissions
- Verify import paths use `.ts` extension

### Static Hosting Issues:
- Ensure all 4 files are uploaded
- Check file names match exactly (case-sensitive)
- Verify MIME types are correct

## Support

For deployment help:
- Val Town: [docs.val.town](https://docs.val.town)
- Deno: [deno.land/manual](https://deno.land/manual)
- Issues: [GitHub Issues](your-repo/issues)

---

**Quick Deploy Checklist:**
- [ ] Choose platform (Val Town recommended)
- [ ] Copy/upload appropriate files
- [ ] Test in browser
- [ ] Check console for errors
- [ ] Test all 4 scenarios
- [ ] Share link with group
- [ ] Enjoy tactical planning!
