const menuData = [
    {
        category: "Chinese Veg",
        emoji: "🥢",
        items: [
            { name: "Veg Chowmein", emoji: "🍜", prices: { half: 60, full: 120 } },
            { name: "Veg Fried Rice", emoji: "🍚", prices: { half: 60, full: 120 } },
            { name: "Paneer Chowmein", emoji: "🧀", prices: { half: 100, full: 200 } },
            { name: "Paneer Fried Rice", emoji: "🍛", prices: { half: 100, full: 200 } },
            { name: "Veg Manchurian", emoji: "🧆", prices: { half: 90, full: 180 } },
            { name: "Veg Manchurian Dry", emoji: "🧆", prices: { full: 200 } },
            { name: "Paneer Chilli", emoji: "🌶️", prices: { half: 90, full: 180 } },
            { name: "Paneer Chilli Dry", emoji: "🌶️", prices: { full: 200 } },
            { name: "Mushroom Chilli", emoji: "🍄", prices: { full: 220 } },
            { name: "Soya Chilli", emoji: "🥡", prices: { full: 220 } },
            { name: "Babycorn Chilli", emoji: "🌽", prices: { full: 220 } },
            { name: "Manchow Soup", emoji: "🥣", prices: { plate: 80 } },
            { name: "Hot & Sour Soup", emoji: "🌶️", prices: { plate: 90 } },
        ],
    },
    {
        category: "Snacks",
        emoji: "🍟",
        items: [
            { name: "Paneer Pakora", emoji: "🧀", prices: { plate: 180 } },
            { name: "Veg Pakora", emoji: "🥦", prices: { plate: 140 } },
            { name: "Spring Roll", emoji: "🌯", prices: { plate: 140 } },
            { name: "Dahi Kebab", emoji: "🍥", prices: { plate: 200 } },
            { name: "Finger Chips", emoji: "🍟", prices: { plate: 140 } },
            { name: "Papad", emoji: "🫓", prices: { pc: 20 } },
        ],
    },
    {
        category: "Rice",
        emoji: "🍚",
        items: [
            { name: "Steam Rice", emoji: "🍚", prices: { full: 70 } },
            { name: "Jeera Rice", emoji: "🍚", prices: { half: 70, full: 120 } },
            { name: "Veg Biryani", emoji: "🍲", prices: { full: 180 } },
            { name: "Paneer Biryani", emoji: "🧀", prices: { full: 200 } },
            { name: "Lemon Rice", emoji: "🍋", prices: { full: 120 } },
        ],
    },
    {
        category: "Indian Veg Main Course",
        emoji: "🥘",
        items: [
            { name: "Paneer Butter Masala", emoji: "🥘", prices: { half: 130, full: 230 } },
            { name: "Matar Paneer", emoji: "🟢", prices: { half: 120, full: 210 } },
            { name: "Paneer Kadhai", emoji: "🥘", prices: { full: 240 } },
            { name: "Palak Paneer", emoji: "🌿", prices: { full: 200 } },
            { name: "Dal Tadka", emoji: "🥣", prices: { full: 120 } },
            { name: "Dal Makhani", emoji: "🏺", prices: { full: 150 } },
        ],
    },
    {
        category: "South Indian",
        emoji: "🥞",
        items: [
            { name: "Plain Dosa", emoji: "🥞", prices: { pc: 100 } },
            { name: "Masala Dosa", emoji: "🥞", prices: { pc: 120 } },
            { name: "Paper Dosa", emoji: "🥞", prices: { pc: 120 } },
            { name: "Butter Masala Dosa", emoji: "🧈", prices: { pc: 130 } },
            { name: "Paneer Masala Dosa", emoji: "🧀", prices: { pc: 150 } },
            { name: "Veg Uttapam", emoji: "🥦", prices: { pc: 150 } },
        ],
    },
    {
        category: "Tandoor & Breads",
        emoji: "🔥",
        items: [
            { name: "Roti", emoji: "🫓", prices: { pc: 15 } },
            { name: "Butter Roti", emoji: "🧈", prices: { pc: 18 } },
            { name: "Plain Naan", emoji: "🫓", prices: { pc: 35 } },
            { name: "Butter Naan", emoji: "🧈", prices: { pc: 40 } },
            { name: "Garlic Naan", emoji: "🧄", prices: { pc: 60 } },
            { name: "Lachha Paratha", emoji: "🥨", prices: { pc: 40 } },
        ],
    },
    {
        category: "Desserts",
        emoji: "🍮",
        items: [
            { name: "Gulab Jamun", emoji: "🍩", prices: { plate: 30 } },
            { name: "Rasgulla", emoji: "⚪", prices: { plate: 30 } },
            { name: "Rasmalai", emoji: "🍨", prices: { plate: 60 } },
        ],
    },
    {
        category: "Ice Cream",
        emoji: "🍦",
        items: [
            { name: "Vanilla", emoji: "🍦", prices: { scoop: 50 } },
            { name: "Chocolate", emoji: "🍫", prices: { scoop: 60 } },
            { name: "Strawberry", emoji: "🍓", prices: { scoop: 55 } },
        ],
    },
    {
        category: "Beverages",
        emoji: "🥤",
        items: [
            { name: "Cold Coffee", emoji: "☕", prices: { glass: 80 } },
            { name: "Soft Drink", emoji: "🍹", prices: { pc: 30 } },
            { name: "Water", emoji: "💧", prices: { pc: 20 } },
            { name: "Fresh Lemon Soda", emoji: "🍋", prices: { glass: 50 } },
            { name: "Blue Lagoon", emoji: "🧊", prices: { glass: 130 } },
        ],
    },
    {
        category: "Thali & Combos",
        emoji: "🍽️",
        items: [
            { name: "General Thali", emoji: "🍱", prices: { plate: 190 } },
            { name: "Special Thali", emoji: "🍱", prices: { plate: 250 } },
            { name: "Party Plate", emoji: "🎉", prices: { plate: 570 } },
            { name: "Special Party Plate", emoji: "👑", prices: { plate: 720 } },
        ],
    },
];

module.exports = { menuData };
