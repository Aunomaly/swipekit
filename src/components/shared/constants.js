export const uid = () => Math.random().toString(36).slice(2, 10);

export const F = "'DM Sans', sans-serif";
export const FS = "'Instrument Serif', serif";

export const C = {
  bg: "#0D0D0F",
  card: "#1a1a1a",
  purple: "#A78BFA",
  purpleDark: "#7C3AED",
  green: "#4AE68A",
  red: "#FF4458",
  yellow: "#FBBF24",
  blue: "#60A5FA",
  white: "#fff",
  dim: "rgba(255,255,255,0.4)",
  border: "rgba(255,255,255,0.08)",
};

export const DRAW_COLORS = [
  "#FF4458",
  "#FBBF24",
  "#4AE68A",
  "#60A5FA",
  "#A78BFA",
  "#fff",
];

export const SAMPLE_DESIGNS = [
  { id: "1", url: "https://picsum.photos/seed/hero2/800/600", name: "Homepage Hero v2" },
  { id: "2", url: "https://picsum.photos/seed/dashboard/800/600", name: "Dashboard Layout" },
  { id: "3", url: "https://picsum.photos/seed/mobilenav/800/600", name: "Mobile Nav Concept" },
  { id: "4", url: "https://picsum.photos/seed/checkout/800/600", name: "Checkout Flow" },
];

export const DEMO_QUESTIONS = [
  { id: "d1", text: "Should we switch to a 4-day work week?", emoji: "📅" },
  { id: "d2", text: "Are you happy with our current tech stack?", emoji: "💻" },
  { id: "d3", text: "Should we allow dogs in the office?", emoji: "🐕" },
  { id: "d4", text: "Do you want more team social events?", emoji: "🎉" },
  { id: "d5", text: "Should we invest in AI tooling this quarter?", emoji: "🤖" },
  { id: "d6", text: "Are standup meetings useful for you?", emoji: "🗣️" },
  { id: "d7", text: "Would you use a co-working stipend?", emoji: "☕" },
  { id: "d8", text: "Should we open-source our design system?", emoji: "🎨" },
];

export const Q_EMOJIS = ["📋", "💡", "🎯", "🚀", "⚡", "🔥", "💬", "📊", "🧪", "🌟"];

export const GRADIENTS = [
  "linear-gradient(135deg, #1a1035 0%, #0f0a1e 100%)",
  "linear-gradient(135deg, #0a1628 0%, #0d0d1a 100%)",
  "linear-gradient(135deg, #1a0a28 0%, #120820 100%)",
  "linear-gradient(135deg, #0a2818 0%, #0d1a12 100%)",
  "linear-gradient(135deg, #281a0a 0%, #1a1208 100%)",
  "linear-gradient(135deg, #0a1a28 0%, #081220 100%)",
  "linear-gradient(135deg, #280a1a 0%, #200812 100%)",
  "linear-gradient(135deg, #1a280a 0%, #122008 100%)",
];
