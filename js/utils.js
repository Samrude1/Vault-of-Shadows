class Utils {

    // Static method: does not need 'this' reference
    static rollDice(num, sides) {
        let total = 0;
        for (let i = 0; i < num; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }

    // You can add other static helper functions here later
    // static clamp(value, min, max) { ... }
}