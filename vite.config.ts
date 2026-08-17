import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },

  // Use Nitro's Vercel preset only on Vercel.
  // This keeps the Lovable/local preview configuration intact.
  nitro: isVercel
    ? {
        preset: "vercel",
      }
    : true,
});
