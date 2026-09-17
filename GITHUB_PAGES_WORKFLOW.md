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
  contents: write

jobs:
  build-and-deploy:
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
        run: npm install
        
      - name: Build
        run: |
          npm run build -- --base=/${{ github.event.repository.name }}/
          cp dist/index.html dist/404.html
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
