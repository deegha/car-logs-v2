// This file intentionally left minimal.
// The Suspense boundary in page.tsx handles the skeleton for streamed navigations.
// Next.js requires this file to exist for the loading segment but the shell
// (Header/Footer) is rendered by the page before the Suspense resolves.
export default function CarDetailLoading() {
  return null;
}
