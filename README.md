# Next Chapter prototype
Quick Access to our App: https://next-chapter-omega.vercel.app/

A responsive React + TypeScript + Vite prototype based on the Next Chapter Figma flow. It includes all ten screens, both opportunity matching outcomes, and clickable navigation between the onboarding and support flows. Fonts and selected Figma photography are stored locally under `public/assets`.

## Figma Link
https://www.figma.com/design/LUxFUBSSOTlHjLod5a5L3x/Next-Chapter?node-id=0-1&t=T9gsPZ1VWe80uGEl-1
<img width="402" height="654" alt="Microsoft Edge 2026-10-08 17 00 51" src="https://github.com/user-attachments/assets/7ef31f40-aa3b-4239-9e6f-943954bb9721" />
<img width="401" height="655" alt="Microsoft Edge 2026-10-08 17 01 00" src="https://github.com/user-attachments/assets/c748ad99-577b-4e95-9a48-739823bc759f" />


## Run locally

```sh
pnpm install
pnpm dev
```

Use the screen selector to jump between screens. In the phone preview, use the buttons and bottom navigation to follow the journey. The screen adapts from a mobile full-screen view to a desktop phone preview with a journey index.

To create a production build, run `pnpm build`.
