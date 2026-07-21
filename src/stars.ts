export function initStars() {
    const canvas = document.createElement('canvas');
    canvas.id = 'stars-canvas';
    // Tailwind classes to put it fixed in the background
    canvas.className = 'fixed inset-0 pointer-events-none z-0';
    
    // We want it behind the content but in front of the pure black background
    // If the body is bg-obsidian or black, z-0 is fine, provided main content has z-10
    // Actually, we can use absolute z-index or insert it as the first child of body
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    });

    const stars: {x: number, y: number, r: number, vx: number, vy: number, alpha: number}[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.5,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            alpha: Math.random()
        });
    }

    function draw() {
        ctx!.clearRect(0, 0, width, height);
        
        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            
            // Move
            star.x += star.vx;
            star.y += star.vy;
            
            // Wrap
            if (star.x < 0) star.x = width;
            if (star.x > width) star.x = 0;
            if (star.y < 0) star.y = height;
            if (star.y > height) star.y = 0;
            
            // Twinkle
            star.alpha += (Math.random() - 0.5) * 0.05;
            if (star.alpha < 0.2) star.alpha = 0.2;
            if (star.alpha > 1) star.alpha = 1;
            
            // Draw
            ctx!.beginPath();
            ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(0, 240, 255, ${star.alpha * 0.5})`; // Cyan tinted stars
            ctx!.fill();
        }
        
        requestAnimationFrame(draw);
    }
    
    draw();
}

// Auto-init if we are in the browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initStars);
}
