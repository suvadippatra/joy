# GitHub Pages Setup

It appears the `.github` hidden folder might not be exporting correctly to GitHub. If you don't see the `.github/workflows/deploy.yml` file in your repository, you can create it manually on GitHub using the code below.

1. On your GitHub repo, click **Add file** > **Create new file**.
2. Name the file exactly: `.github/workflows/deploy.yml`
3. Paste the following code into it and click **Commit changes**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4
        with:
          enablement: true
      - name: Build
        run: |
          npm run build -- --base=${{ steps.pages.outputs.base_path }}/
          cp dist/index.html dist/404.html
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
