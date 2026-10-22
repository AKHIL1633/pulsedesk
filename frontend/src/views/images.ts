/** Unsplash photos used across the dashboard (free to use under the Unsplash License). */
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=75`;

export const IMAGES = {
  loginHero: unsplash("photo-1551434678-e076c223a692", 1400),
  dashboardBanner: unsplash("photo-1519389950473-47ba0277781c", 1800),
  allCaughtUp: unsplash("photo-1600880292203-757bb62b4baf", 900),
};
