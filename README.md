# Christian & Ericka Wedding Invitation

## Start locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The admin editor is at `/admin` on that same origin.

## Edit the invitation

On the first local visit to `/admin`, create a passcode with at least 8 characters. Later visits require that passcode before settings or photos can be changed. The server stores a salted passcode hash and keeps an authenticated session in an HTTP-only cookie.

The editor updates names, dates and times, venue details and map links, schedule, dress code and palette, entourage, story, gift message, reminders, hero image, and gallery photos. Choose **Save all changes** to publish edits. Image uploads accept JPEG, PNG, and WebP up to 12 MB. Gallery and hero uploads are stored in `public/PhotoGallery`; invitation settings are stored in the ignored `data/invitation.json` file.

Back up `data/` and `public/PhotoGallery/` to preserve invitation edits and uploaded images.

## Production

Build and start the Express server:

```sh
npm run build
npm start
```

Set `NODE_ENV=production`, `PORT`, and a strong `ADMIN_PASSCODE` in the hosting environment before starting the server. Production does not allow first-time passcode setup from the public site. If the site is hosted on a different origin, set `PUBLIC_ORIGIN` to its exact origin, including the scheme.

The host must provide persistent writable storage for `data/` and `public/PhotoGallery/`; ephemeral deployments will lose saved edits and uploads when restarted.