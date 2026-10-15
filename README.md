# Christian & Ericka Wedding Invitation

## Run locally

```sh
npm install
npm run dev
```

## Edit the invitation

Update the `defaultInvitation` object in `src/weddingData.js`, then commit and deploy the changes. Add image files to `public/PhotoGallery/` and reference them with paths such as `/PhotoGallery/engagement.jpg`. Remote image URLs must use HTTPS.

This is a public-only static site. It does not include the admin editor, API, or in-site photo uploads. The ignored `data/invitation.json` file is not used by the Vercel deployment.

## Deploy to Vercel

1. Push the project to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the Vite framework preset. The build command is `npm run build` and the output directory is `dist`; these are also set in `vercel.json`.
4. Select **Deploy**. No environment variables or persistent disk are required.

After deployment, open the Vercel URL and check the invitation and its images. Future invitation or photo changes go live when committed and redeployed.