class Utils {

    // Staattinen metodi: ei tarvitse this-viitettä
    static rollDice(num, sides) {
        let total = 0;
        for (let i = 0; i < num; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }

    // Tähän voit lisätä muita staattisia apufunktioita myöhemmin
    // static clamp(value, min, max) { ... }
}