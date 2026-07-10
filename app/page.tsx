import { HomeContent } from '@/components/home/HomeContent';

// The bare "/" route is the admin / 全チーム view — viewer team is chosen
// via the header dropdown (default = 全チーム). For team-scoped access use
// /t/[slug].
export default function HomePage() {
  return <HomeContent />;
}
