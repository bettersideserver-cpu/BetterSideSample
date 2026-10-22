# 360° Panorama Viewer

A static, mobile-friendly panorama viewer with a numbered image bar, drag/touch navigation, zoom, auto rotation, and fullscreen where supported. The Pannellum 2.5.6 library and its license are included in `vendor/`; no CDN or API key is required.

## Host on GitHub Pages (automatic image discovery)

1. Upload this folder's contents to your GitHub repository, including `.github/workflows/pages.yml`, `vendor/`, and `images/`. Keep `index.html` at the repository root.
2. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `main` or `master`, or run **Actions → Publish panorama viewer → Run workflow**. If your branch has another name, edit `branches` in the workflow.
4. Open the website URL shown by the deployment.

To add a panorama, upload a JPG, JPEG, PNG, or WebP directly into `images/`, for example `images/2LivingRoom.jpg`, and commit it. The workflow scans that folder and creates the numbered bar automatically on every deployment. Images are sorted by filename using numeric order. The generated list is part of the deployment; it is not committed back to the repository.

## Local preview or ordinary static hosting

Run `node scripts/generate-panoramas.mjs` after adding or removing images. Alternatively, edit `panoramas.js` manually:

```js
window.PANORAMAS = [
  { src: "images/1Terrace.jpg", title: "Terrace" },
  { src: "images/2LivingRoom.jpg", title: "Living Room" }
];
```

Start a local server with `python -m http.server 8000`, then visit http://localhost:8000. Use an HTTP server instead of double-clicking the HTML file, because browsers may block local image loading.

If using GitHub's **Deploy from a branch** option instead of Actions, keep `panoramas.js` updated yourself. Browsers cannot automatically list files in a GitHub Pages folder. The Actions workflow replaces manual titles with names derived from filenames; use manual hosting if you want to maintain custom titles.

Use full 360° equirectangular panoramas (normally 2:1, such as 4096 × 2048). Ordinary photos do not become true panoramas. Your included `1Terrace.jpg` is 4096 × 2048. Paths are case-sensitive on GitHub Pages. Smaller images are faster on mobile; 4096 × 2048 is a useful starting point.

Viewer documentation: https://pannellum.org/documentation/ . Hosting documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages .
