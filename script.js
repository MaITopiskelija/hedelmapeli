class SlotMachine {
    constructor(startingMoney) {
        this.money = startingMoney;
        this.reels = [null, null, null, null];
        this.lockedReels = [false, false, false, false];
        this.previousLocks = [false, false, false, false];
        this.preventLocking = false;
        this.symbols = ["🍏", "🍐", "🍒", "🍉", "7"];
        this.spinSound = new Audio('spin-sound.mp3');
        this.updateUI();
    }

    spin() {
        let bet = parseInt(document.getElementById("bet").value);
        if (isNaN(bet) || bet > this.money || bet < 1) {
            this.showMessage("Ei tarpeeksi rahaa tai panos liian pieni!", "red");
            return;
        }

        this.money -= bet;
        this.spinSound.play();

        this.preventLocking = true; // Estetään lukitus tällä kierroksella

        const spinIntervals = [];
        let spinsCompleted = 0;
        const totalSpins = this.reels.length - this.lockedReels.filter(Boolean).length;

        for (let i = 0; i < this.reels.length; i++) {
            if (!this.lockedReels[i]) {
                const reelElement = document.getElementById(`reel${i}`);
                reelElement.classList.add("spinning");

                let count = 0;
                spinIntervals[i] = setInterval(() => {
                    reelElement.innerText = this.getRandomSymbol();
                    count++;
                    if (count >= 10) {
                        clearInterval(spinIntervals[i]);
                        this.reels[i] = this.getRandomSymbol();
                        reelElement.innerText = this.reels[i];
                        reelElement.classList.remove("spinning");

                        spinsCompleted++;
                        if (spinsCompleted === totalSpins) {
                            this.evaluateWin(bet);
                        }
                    }
                }, 100);
            } else {
                spinsCompleted++;
                if (spinsCompleted === totalSpins) {
                    this.evaluateWin(bet);
                }
            }
        }

        this.previousLocks = [...this.lockedReels]; // Tallennetaan edellisen kierroksen lukot
        this.resetLocks(); // Nollataan nykyiset lukot
    }

    evaluateWin(bet) {
        const win = this.checkWin(bet);
        this.money += win;

        // Jos tuli voittoa, estetään lukitus seuraavalla kierroksella
        this.preventLocking = win > 0;

        if (win > 0) {
            this.showMessage(`Voitit ${win}€!`, "green");
        } else {
            this.showMessage("Ei voittoa, yritä uudelleen!", "black");
        }

        this.updateUI();
    }

    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }

    checkWin(bet) {
        const counts = this.reels.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
        }, {});

        // Voitot neljä symbolilla
        if (counts["7"] === 4) return bet * 10;
        if (counts["🍏"] === 4) return bet * 6;
        if (counts["🍉"] === 4) return bet * 5;
        if (counts["🍐"] === 4) return bet * 4;
        if (counts["🍒"] === 4) return bet * 3;
        
                 
            // Voitto kolmella symbolilla (myös "7")
            if (counts["7"] === 3) return bet * 5;
          
            return 0;
        }
        
       
  

    lockReel(index) {
        if (this.preventLocking) {
            this.showMessage("Et voi lukita rullia tällä kierroksella.", "gray");
            return;
        }

        if (this.previousLocks[index]) {
            this.showMessage("Et voi lukita samaa rullaa peräkkäin.", "gray");
            return;
        }

        this.lockedReels[index] = !this.lockedReels[index];
        this.updateUI();
    }

    resetLocks() {
        this.lockedReels = [false, false, false, false];
    }

    updateUI() {
        document.getElementById("money").innerText = `Rahat: ${this.money}€`;

        this.lockedReels.forEach((locked, index) => {
            const lockBtn = document.getElementById(`lock${index}`);
            lockBtn.className = "lock-button";

            if (this.preventLocking) {
                lockBtn.innerText = "🚫";
                lockBtn.disabled = true;
                lockBtn.title = "Lukitseminen ei sallittua tällä kierroksella.";
                lockBtn.classList.add("disabled");
            } else if (this.previousLocks[index]) {
                lockBtn.innerText = "🚫";
                lockBtn.disabled = true;
                lockBtn.title = "Et voi lukita samaa rullaa peräkkäin.";
                lockBtn.classList.add("disabled");
            } else {
                lockBtn.innerText = locked ? "🔒" : "🔓";
                lockBtn.disabled = false;
                lockBtn.title = locked ? "Rulla on lukittu" : "Klikkaa lukitaksesi rullan";
                if (locked) lockBtn.classList.add("locked");
            }
        });
    }

    showMessage(message, color = "black") {
        const msg = document.getElementById("message");
        msg.innerText = message;
        msg.style.color = color;
    }
}

// Pelin alustus
const game = new SlotMachine(50);

document.getElementById("spin").addEventListener("click", () => game.spin());

for (let i = 0; i < 4; i++) {
    document.getElementById(`lock${i}`).addEventListener("click", () => game.lockReel(i));
}
