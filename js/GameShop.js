class GameShop {
    constructor(game) {
        this.game = game;
        this.shopOpen = false;
    }

    open() {
        this.shopOpen = true;
        this.game.sound.playShop();

        const shopOverlay = document.getElementById('shop-overlay');
        const shopGoldAmount = document.getElementById('shop-gold-amount');
        const shopClose = document.getElementById('shop-close');

        // Update gold display
        shopGoldAmount.textContent = this.game.player.gold;

        // Show shop
        shopOverlay.classList.remove('hidden');

        // Setup shop item click handlers
        const shopItems = document.querySelectorAll('.shop-item');
        shopItems.forEach(item => {
            // Remove existing listeners by cloning
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            const itemType = newItem.getAttribute('data-item');
            let price = parseInt(newItem.getAttribute('data-price')); // Base price

            // Dynamic pricing logic
            if (itemType.startsWith('scroll_')) {
                // Scrolls scale moderately with level
                price = price + (this.game.currentLevel * 5);
            } else if (itemType === 'weapon_tier' || itemType === 'armor_tier') {
                // Equipment scales heavily with level
                price = 100 + (this.game.currentLevel * 20);

                // Update item name and description based on level
                const nameEl = newItem.querySelector('.shop-item-name');
                const descEl = newItem.querySelector('.shop-item-desc');

                if (itemType === 'weapon_tier') {
                    const weaponInfo = this.getWeaponForLevel(this.game.currentLevel);
                    nameEl.textContent = weaponInfo.name;
                    descEl.textContent = `(+${weaponInfo.attackBonus} Attack${weaponInfo.defenseBonus > 0 ? ', +' + weaponInfo.defenseBonus + ' Defense' : ''})`;
                } else {
                    const armorInfo = this.getArmorForLevel(this.game.currentLevel);
                    nameEl.textContent = armorInfo.name;
                    descEl.textContent = `(+${armorInfo.defenseBonus} Defense${armorInfo.attackBonus > 0 ? ', +' + armorInfo.attackBonus + ' Attack' : ''})`;
                }
            } else {
                // Consumables scale lightly with dungeon depth
                price = price + (this.game.currentLevel * 3);
            }

            // Update UI with new price
            newItem.setAttribute('data-price', price);
            const priceEl = newItem.querySelector('.shop-item-price');
            if (priceEl) {
                priceEl.textContent = `${price} gold`;
            }

            newItem.addEventListener('click', () => {
                const currentPrice = parseInt(newItem.getAttribute('data-price'));
                this.purchaseItem(itemType, currentPrice);
            });
        });

        // Setup close button
        const newCloseBtn = shopClose.cloneNode(true);
        shopClose.parentNode.replaceChild(newCloseBtn, shopClose);
        newCloseBtn.addEventListener('click', () => {
            this.close();
        });

        // Setup ESC key to close shop
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.close();
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);

        this.game.addMessage('Welcome to the shop! Press B or ESC to close.');
    }

    close() {
        this.shopOpen = false;
        const shopOverlay = document.getElementById('shop-overlay');
        shopOverlay.classList.add('hidden');
    }

    getWeaponForLevel(level) {
        if (level <= 4) {
            return { type: 'sword', name: 'Sword', attackBonus: 2, defenseBonus: 0 };
        } else if (level <= 8) {
            return { type: 'axe', name: 'Axe', attackBonus: 3, defenseBonus: 0 };
        } else {
            return { type: 'magic_staff', name: 'Magic Staff', attackBonus: 2, defenseBonus: 1 };
        }
    }

    getArmorForLevel(level) {
        if (level <= 4) {
            return { type: 'chain_mail', name: 'Chain Mail', attackBonus: 0, defenseBonus: 2 };
        } else if (level <= 8) {
            return { type: 'plate_armor', name: 'Plate Armor', attackBonus: 0, defenseBonus: 3 };
        } else {
            return { type: 'magic_robes', name: 'Magic Robes', attackBonus: 1, defenseBonus: 2 };
        }
    }

    purchaseItem(itemType, price) {
        if (this.game.player.gold < price) {
            this.game.addMessage('Not enough gold!');
            return;
        }

        // Check if trying to buy a scroll or carryable potion but inventory is full
        if ((itemType.startsWith('scroll_') || itemType.startsWith('potion_')) && this.game.player.inventory !== null) {
            this.game.addMessage('Inventory full! Use your current item first (Press U).');
            return;
        }

        this.game.player.gold -= price;
        this.game.sound.playPurchase();

        // Handle scrolls and carryable potions - add to inventory
        if (itemType.startsWith('scroll_') || itemType.startsWith('potion_')) {
            this.game.player.inventory = itemType;
            const itemData = Item.getItemData(itemType);
            this.game.addMessage(`Purchased ${itemData.name} for ${price} gold! Press U to use.`);
        }
        // Handle equipment
        else if (itemType === 'weapon_tier') {
            const weaponInfo = this.getWeaponForLevel(this.game.currentLevel);
            const weaponData = Item.getItemData(weaponInfo.type);
            this.game.player.equipWeapon(weaponData);
            this.game.addMessage(`Purchased ${weaponInfo.name} for ${price} gold. Attack +${weaponInfo.attackBonus}!`);
        }
        else if (itemType === 'armor_tier') {
            const armorInfo = this.getArmorForLevel(this.game.currentLevel);
            const armorData = Item.getItemData(armorInfo.type);
            this.game.player.equipArmor(armorData);
            this.game.addMessage(`Purchased ${armorInfo.name} for ${price} gold. Defense +${armorInfo.defenseBonus}!`);
        }
        // Handle consumables
        else {
            switch (itemType) {
                case 'health_potion':
                    this.game.player.heal(10);
                    this.game.addMessage(`Purchased Health Potion for ${price} gold. +10 HP!`);
                    break;
                case 'rations':
                    this.game.player.eat(30);
                    this.game.addMessage(`Purchased Rations for ${price} gold. Hunger restored!`);
                    break;
            }
        }

        // Update shop gold display
        document.getElementById('shop-gold-amount').textContent = this.game.player.gold;
        this.game.updateUI();
    }
}
