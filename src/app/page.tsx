import AuthChecker from "./AuthChecker";

export const dynamic = 'force-dynamic';

export default async function Home() {
  return <AuthChecker />;
}
