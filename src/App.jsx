import { useEffect, useState } from 'react';
import TimeForm from './components/timeForm';

function App() {
  return (
    <main className="min-h-screen w-full bg-gray-100">
      <div className="relative z-10">
        <TimeForm />
      </div>
    </main>
  );
}

export default App;
