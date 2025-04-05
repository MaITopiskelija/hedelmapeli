class SlotMachine {
    constructor(startingMoney) {
        this.money = startingMoney;
        this.reels = [null, null, null, null];
        this.lockedReels = [false, false, false, false];
        this.symbols = ["🍏", "🍐", "🍒", "🍉", "7"];
        this.spinSound = new Audio('spin-sound.mp3'); // Ääniefekti
        this.updateUI();
    }

    spin() {
        let panostus = parseInt(document.getElementById("bet").value);
        if (panostus > this.money || panostus < 1) {
            this.showMessage("Ei tarpeeksi rahaa tai panos liian pieni!", "red");
            return;
        }

        this.money -= panostus;
        this.spinSound.play();

        let spinIntervals = [];
        let spinsCompleted = 0;

        for (let i = 0; i < this.reels.length; i++) {
            if (!this.lockedReels[i]) {
                let reelElement = document.getElementById(`reel${i}`);
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
                        if (spinsCompleted === this.reels.length - this.lockedReels.filter(Boolean).length) {
                            this.evaluateWin(panostus);
                        }
                    }
                }, 100);
            } else {
                spinsCompleted++;
            }
        }

        // Poistetaan lukitukset heti, kun peli käynnistyy
        this.resetLocks();
    }

    evaluateWin(panostus) {
        let voitto = this.checkWin(panostus);
        this.money += voitto;
        this.updateUI();

        if (voitto > 0) {
            this.showMessage(`Voitit ${voitto}€!`, "green");
        } else {
            this.showMessage("Ei voittoa, yritä uudelleen!", "black");
        }
    }

    getRandomSymbol() {
        return this.symbols[Math.floor(Math.random() * this.symbols.length)];
    }
            // Tarkistetaan voitot
    checkWin(panostus) {
        const counts = this.reels.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
        }, {});

        if (counts["7"] === 4) return panostus * 10;
        if (counts["🍏"] === 4) return panostus * 6;
        if (counts["🍉"] === 4) return panostus * 5;
        if (counts["🍐"] === 4) return panostus * 4;
        if (counts["🍒"] === 4) return panostus * 3;
        if (counts["7"] === 3) return panostus * 5;
        return 0;
    }

    lockReel(index) {
        this.lockedReels[index] = !this.lockedReels[index];
        this.updateUI();
    }

    resetLocks() {
        this.lockedReels = [false, false, false, false];
        this.updateUI();
    }

    updateUI() {
        document.getElementById("money").innerText = `Rahat: ${this.money}€`;

        this.lockedReels.forEach((locked, index) => {
            let lockElement = document.getElementById(`lock${index}`);
            lockElement.innerText = locked ? "🔒" : "🔓";
            lockElement.disabled = locked; // Estetään samaa lukkoa pitämästä jatkuvasti
        });
    }

    showMessage(message, color = "black") {
        let messageBox = document.getElementById("message");
        messageBox.innerText = message;
        messageBox.style.color = color;
    }
}

let game = new SlotMachine(50);

document.getElementById("spin").addEventListener("click", () => game.spin());

for (let i = 0; i < 4; i++) {
    document.getElementById(`lock${i}`).addEventListener("click", () => game.lockReel(i));
}
