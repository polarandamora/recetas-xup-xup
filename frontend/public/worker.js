let interval;
let timeLeft;

self.onmessage = function(e) {
    const { action, duration } = e.data;

    switch (action) {
        case 'start':
            if (!interval) {
                if (typeof timeLeft === 'undefined') {
                    timeLeft = duration * 60;
                }
                interval = setInterval(() => {
                    timeLeft--;
                    self.postMessage({ timeLeft });
                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        interval = null;
                    }
                }, 1000);
            }
            break;
        case 'pause':
            clearInterval(interval);
            interval = null;
            break;
        case 'reset':
            clearInterval(interval);
            interval = null;
            timeLeft = duration * 60;
            self.postMessage({ timeLeft });
            break;
        default:
            break;
    }
};