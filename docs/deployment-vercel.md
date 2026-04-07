# OpenGym PWA Deployment Notes

## Vercel Environment Variables

Set this in Vercel project settings:

- `NEXT_PUBLIC_API_URL` = your live FastAPI URL

## Build Settings

`vercel.json` is configured with:

- framework: `nextjs`
- install command: `npm install`
- build command: `npm run build`
- dev command: `npm run dev`

## PWA Lighthouse Audit (Production URL)

After deploying, run Lighthouse on your Vercel URL and verify PWA installability checks pass.

## Backend CORS Update

Update FastAPI `CORSMiddleware` to allow your deployed Vercel origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app-name.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

You can also include your local dev URL if needed.
