import './stars';
import './style.css';

const root = document.getElementById('root')!;
root.innerHTML = `
  <div class="min-h-screen bg-transparent text-gray-300 font-sans p-6 lg:p-12 overflow-y-auto custom-scrollbar">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center gap-4 mb-8">
        <a href="/" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-white/10">Home</a>
        <a href="/journal.html" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-white/10">Memory</a>
      </div>

      <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-emerald mb-8 tracking-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
        The Event-Driven Simulator
      </h1>

      <div class="space-y-8 text-lg leading-relaxed text-gray-400">
        <section class="bg-black/40 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            How does voltage stabilize?
          </h2>
          <p class="mb-4">
            Instead of executing procedural "if/else" logic to decide what a circuit does, our engine simulates raw physics using a <strong>Breadth-First Search (BFS) Event Queue</strong>. 
          </p>
          <ul class="list-disc pl-6 space-y-3 mb-4 text-gray-300">
            <li>When you toggle a switch, a <code class="text-neon-cyan font-mono bg-gray-900 px-2 py-0.5 rounded border border-white/5">Wire</code> physically changes its voltage.</li>
            <li>The wire instantly alerts all gates connected to it, pushing them into an <code class="text-neon-cyan font-mono bg-gray-900 px-2 py-0.5 rounded border border-white/5">eventQueue</code> (a Javascript Set ensures no duplicates).</li>
            <li>The <code class="text-neon-emerald font-mono bg-gray-900 px-2 py-0.5 rounded border border-white/5">Simulator.stabilize()</code> function runs a loop: it pops a gate off the queue, evaluates its basic physical logic <code class="text-gray-400 font-mono bg-gray-900 px-2 py-0.5 rounded border border-white/5">!(a && b)</code>, and updates its output wire.</li>
            <li>If that output wire changed voltage, it wakes up the next connected gates and pushes them into the queue!</li>
          </ul>
          <p>
            The loop naturally continues cascading through the circuit until no more wires change voltage. Once the queue is empty, the circuit is mathematically <strong>stable</strong>!
          </p>
        </section>

        <section class="bg-black/40 border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 class="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            When will they NOT stabilize?
          </h2>
          <p class="mb-4">
            If you tie the output of a NOT gate back into its own input (or loop an odd number of NOT gates together), you create a logical paradox.
          </p>
          <p class="mb-4">
            When the output is 1, it feeds back as 1, making the output 0. But now the input is 0, making the output 1! The voltage infinitely oscillates back and forth. This is called a <strong class="text-white">Ring Oscillator</strong>.
          </p>
          <p class="mb-4">
            In our event-driven engine, this oscillation would cause an infinite loop, freezing the browser! To prevent this, our engine has a safety limiter:
          </p>
          <div class="bg-transparent border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto shadow-inner mb-4">
<pre>
<span class="text-pink-500">let</span> maxIterations = <span class="text-purple-400">100000</span>;
<span class="text-pink-500">while</span> (queue.size > <span class="text-purple-400">0</span> && maxIterations > <span class="text-purple-400">0</span>) {
    <span class="text-gray-500">// evaluate physical gates</span>
    maxIterations--;
}
</pre>
          </div>
          <p class="">
            If it hits 100,000 evaluations without stabilizing, the simulator safely pauses the execution. However, we can also choose to harness this! By evaluating a Ring Oscillator exactly 1 tick per visual frame using <code class="text-neon-cyan font-mono bg-gray-900 px-2 py-0.5 rounded border border-white/5">requestAnimationFrame</code>, we create a beautiful, infinitely looping animation (check out the <strong>OSC</strong> tab on the Home page!).
          </p>
        </section>
      </div>
    </div>
  </div>
`;
