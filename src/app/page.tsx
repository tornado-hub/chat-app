import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to the Chat Application</h1>
      <nav>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </nav>
    </main>
  );
}