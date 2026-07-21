const fs = require('fs');

let mainCode = fs.readFileSync('src/main.ts', 'utf8');

const newLinksMain = \`
        <a href="/journal.html" class="mt-8 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            Explore the Physics of Memory
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="/alu.html" class="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-emerald/10 hover:bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            Build the Arithmetic Logic Unit
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
        <a href="/engine.html" class="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            How the Simulator Works
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </a>
\`;

mainCode = mainCode.replace(/<a href="\\/journal\.html"[\s\S]*?<\/a>\s*<a href="\\/engine\.html"[\s\S]*?<\/a>/, newLinksMain);

fs.writeFileSync('src/main.ts', mainCode);

let journalCode = fs.readFileSync('src/journal.ts', 'utf8');

const newLinksJournal = \`
        <div class="mt-8 space-y-4">
            <a href="/" class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Physics Engine
            </a>
            <a href="/alu.html" class="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neon-emerald/10 hover:bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                Next: The Arithmetic Logic Unit
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        </div>
\`;

journalCode = journalCode.replace(/<a href="\\/"[\s\S]*?<\/a>/, newLinksJournal);

fs.writeFileSync('src/journal.ts', journalCode);

console.log('Links patched!');
