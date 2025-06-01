class ProTimer {
            constructor() {
                this.startTime = 0;
                this.elapsedTime = 0;
                this.timerInterval = null;
                this.isRunning = false;
                this.lapCount = 0;
                this.laps = [];
                
                this.display = document.getElementById('display');
                this.displayContainer = document.getElementById('displayContainer');
                this.startBtn = document.getElementById('startBtn');
                this.lapBtn = document.getElementById('lapBtn');
                this.resetBtn = document.getElementById('resetBtn');
                this.lapSection = document.getElementById('lapSection');
                this.lapContainer = document.getElementById('lapContainer');
                this.lapCounter = document.getElementById('lapCounter');
                this.statusIndicator = document.getElementById('statusIndicator');
                this.statusText = document.getElementById('statusText');
                
                this.initEventListeners();
                this.updateDisplay();
            }

            formatTime(milliseconds) {
                const totalSeconds = Math.floor(milliseconds / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const ms = Math.floor((milliseconds % 1000) / 10);
                
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
            }

            updateDisplay() {
                if (this.isRunning) {
                    const currentTime = Date.now();
                    this.elapsedTime = currentTime - this.startTime;
                }
                this.display.textContent = this.formatTime(this.elapsedTime);
            }

            startStop() {
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.pause();
                }
            }

            start() {
                this.startTime = Date.now() - this.elapsedTime;
                this.timerInterval = setInterval(() => this.updateDisplay(), 10);
                this.isRunning = true;
                
                this.startBtn.textContent = 'Pause';
                this.startBtn.className = 'btn btn-pause';
                this.lapBtn.disabled = false;
                
                this.displayContainer.classList.add('running');
                this.display.classList.add('running');
                this.display.classList.remove('paused');
                
                this.statusIndicator.className = 'status-indicator running';
                this.statusText.textContent = 'Running';
            }

            pause() {
                clearInterval(this.timerInterval);
                this.isRunning = false;
                
                this.startBtn.textContent = 'Resume';
                this.startBtn.className = 'btn btn-start';
                this.lapBtn.disabled = true;
                
                this.displayContainer.classList.remove('running');
                this.display.classList.add('paused');
                this.display.classList.remove('running');
                
                this.statusIndicator.className = 'status-indicator paused';
                this.statusText.textContent = 'Paused';
            }

            reset() {
                clearInterval(this.timerInterval);
                this.isRunning = false;
                this.elapsedTime = 0;
                this.lapCount = 0;
                this.laps = [];
                
                this.updateDisplay();
                
                this.startBtn.textContent = 'Start';
                this.startBtn.className = 'btn btn-start';
                this.lapBtn.disabled = true;
                
                this.displayContainer.classList.remove('running');
                this.display.classList.remove('running', 'paused');
                
                this.statusIndicator.className = 'status-indicator stopped';
                this.statusText.textContent = 'Ready';
                
                this.lapSection.style.display = 'none';
                this.lapContainer.innerHTML = '<div class="no-laps">No laps recorded yet</div>';
                this.lapCounter.textContent = '0';
            }

            recordLap() {
                if (!this.isRunning) return;
                
                this.lapCount++;
                const lapTime = this.elapsedTime;
                const splitTime = this.lapCount === 1 ? lapTime : lapTime - this.laps[this.laps.length - 1].time;
                
                this.laps.push({
                    number: this.lapCount,
                    time: lapTime,
                    split: splitTime
                });
                
                this.updateLapDisplay();
            }

            updateLapDisplay() {
                this.lapSection.style.display = 'block';
                this.lapCounter.textContent = this.lapCount;
                
                if (this.lapContainer.querySelector('.no-laps')) {
                    this.lapContainer.innerHTML = '';
                }
                
                // Find fastest and slowest splits (excluding first lap)
                const splits = this.laps.slice(1).map(lap => lap.split);
                const fastestSplit = splits.length > 0 ? Math.min(...splits) : null;
                const slowestSplit = splits.length > 0 ? Math.max(...splits) : null;
                
                const lapItem = document.createElement('div');
                lapItem.className = 'lap-item';
                
                let rankClass = 'normal';
                let rankText = this.lapCount;
                
                if (this.lapCount > 1) {
                    const currentSplit = this.laps[this.laps.length - 1].split;
                    if (currentSplit === fastestSplit) {
                        rankClass = 'fastest';
                        rankText = '🚀';
                    } else if (currentSplit === slowestSplit && splits.length > 1) {
                        rankClass = 'slowest';
                        rankText = '🐢';
                    }
                }
                
                lapItem.innerHTML = `
                    <div class="lap-rank ${rankClass}">${rankText}</div>
                    <div class="lap-number">Lap ${this.lapCount}</div>
                    <div class="lap-time">${this.formatTime(this.laps[this.laps.length - 1].time)}</div>
                    <div class="lap-split">+${this.formatTime(this.laps[this.laps.length - 1].split)}</div>
                `;
                
                this.lapContainer.insertBefore(lapItem, this.lapContainer.firstChild);
                
                // Animation
                lapItem.style.opacity = '0';
                lapItem.style.transform = 'translateY(-20px) scale(0.9)';
                setTimeout(() => {
                    lapItem.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    lapItem.style.opacity = '1';
                    lapItem.style.transform = 'translateY(0) scale(1)';
                }, 10);
            }

            initEventListeners() {
                document.addEventListener('keydown', (event) => {
                    switch(event.code) {
                        case 'Space':
                            event.preventDefault();
                            this.startStop();
                            break;
                        case 'KeyL':
                            event.preventDefault();
                            if (!this.lapBtn.disabled) this.recordLap();
                            break;
                        case 'KeyR':
                            event.preventDefault();
                            this.reset();
                            break;
                    }
                });
            }
        }

        // Initialize the timer
        const timer = new ProTimer();

        // Global functions for onclick handlers
        function startStop() { timer.startStop(); }
        function recordLap() { timer.recordLap(); }
        function reset() { timer.reset(); }