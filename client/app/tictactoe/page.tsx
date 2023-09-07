import Link from 'next/link';

import Board from '@/components/board';

export default function TicTacToePage() {
  return (
    <section className='container grid items-center gap-6 pb-8 pt-6 md:py-10'>
      <Board />
    </section>
  );
}
