// Café Deutsch data. Single source for the quiz AND the reference tables on the start screen.
// Prices come from the two Coffee Pony photos; anything that couldn't be read for sure is left out of the quiz.
(function (root) {
  const D = {};

  // ---- things a customer can order (used for "what does the customer want?") ----
  D.sizes = { large: { de: "großen", en: "large" }, double: { de: "doppelten", en: "double" } };
  D.milks = [{ de: "Hafermilch", en: "oat milk" }, { de: "Sojamilch", en: "soy milk" }, { de: "Mandelmilch", en: "almond milk" }];
  // price = cents, null = not readable on the photo (never used in price questions)
  D.drinks = [
    { id: "espresso",   de: "Espresso",         en: "espresso",       art: "einen", milk: false, sizes: ["double"], price: 280 },
    { id: "americano",  de: "Americano",        en: "americano",      art: "einen", milk: false, sizes: ["large"],  price: 360 },
    { id: "cappuccino", de: "Cappuccino",       en: "cappuccino",     art: "einen", milk: true,  sizes: ["large"],  price: 380 },
    { id: "flatwhite",  de: "Flat White",       en: "flat white",     art: "einen", milk: true,  sizes: [],         price: null },
    { id: "chai",       de: "Chai Latte",       en: "chai latte",     art: "einen", milk: true,  sizes: [],         price: 490 },
    { id: "matcha",     de: "Matcha",           en: "matcha",         art: "einen", milk: true,  sizes: [],         price: 490 },
    { id: "choc",       de: "heiße Schokolade", en: "hot chocolate",  art: "eine",  milk: false, sizes: [],         price: 490 }
  ];
  D.foods = [
    { de: "einen Bagel mit Avocado und Hummus",           en: "a bagel with avocado and hummus" },
    { de: "einen Bagel mit Räucherlachs und Avocado",     en: "a bagel with smoked salmon and avocado" },
    { de: "einen Bagel mit Tomate, Mozzarella und Pesto", en: "a bagel with tomato, mozzarella and pesto" },
    { de: "einen Bagel mit Avocado und Frischkäse",       en: "a bagel with avocado and cream cheese" },
    { de: "ein Hummus Brot",                              en: "a hummus bread" },
    { de: "ein Käse Omelette",                            en: "a cheese omelette" },
    { de: "ein Rührei mit Lachs",                         en: "scrambled eggs with salmon" }
  ];
  // items with a readable price (for "say the total" questions)
  D.priced = [
    { en: "a cappuccino", price: 380 }, { en: "an americano", price: 360 }, { en: "an espresso", price: 280 },
    { en: "a chai latte", price: 490 }, { en: "a hot chocolate", price: 490 },
    { en: "a hummus bread", price: 900 }, { en: "a cheese omelette", price: 990 }, { en: "scrambled eggs with salmon", price: 980 },
    { en: "an avocado bread", price: 990 }, { en: "pancakes", price: 1190 }, { en: "a French (croissant breakfast)", price: 750 }
  ];

  // ---- you ask (Sie form). First variant is the one shown as the model answer. ----
  D.ask = [
    { en: "Ask what they would like.", a: ["Was darf es sein?", "Was möchten Sie?", "Was darf ich Ihnen bringen?", "Was darf ich Ihnen geben?", "Was hätten Sie gern?", "Was möchten Sie bestellen?", "Was darf's sein?"] },
    { en: "Ask: for here or to go?", a: ["Hier oder zum Mitnehmen?", "Zum Mitnehmen oder hier?", "Essen Sie hier oder zum Mitnehmen?", "Trinken Sie hier oder zum Mitnehmen?", "Ist das zum Mitnehmen?", "Möchten Sie es zum Mitnehmen?", "Hier oder to go?"] },
    { en: "Ask if they would like oat milk with that.", a: ["Mit Hafermilch?", "Möchten Sie Hafermilch?", "Möchten Sie das mit Hafermilch?", "Wollen Sie Hafermilch?"] },
    { en: "Ask if there is anything else.", a: ["Sonst noch etwas?", "Noch etwas?", "Darf es sonst noch etwas sein?", "Darf es noch etwas sein?", "Möchten Sie noch etwas?", "Wünschen Sie sonst noch etwas?", "Haben Sie noch einen Wunsch?", "Sonst noch was?"] },
    { en: "Ask: cash or card?", a: ["Bar oder mit Karte?", "Zahlen Sie bar oder mit Karte?", "Bezahlen Sie bar oder mit Karte?", "Möchten Sie bar oder mit Karte bezahlen?", "Bar oder Karte?", "Zahlen Sie bar oder per Karte?"] },
    { en: "Ask if they need a receipt.", a: ["Brauchen Sie einen Beleg?", "Möchten Sie einen Beleg?", "Wollen Sie einen Beleg?", "Brauchen Sie eine Quittung?", "Möchten Sie eine Quittung?", "Einen Beleg?"] },
    { en: "Tell them their drink is ready.", a: ["Ihr Getränk ist fertig.", "Ihr Kaffee ist fertig.", "Ihr Cappuccino ist fertig.", "Ihre Bestellung ist fertig."] },
    { en: "Say: here you go.", a: ["Bitte schön.", "Bitteschön.", "Bitte sehr.", "Hier, bitte.", "Hier bitte."] },
    { en: "Say: one moment, please.", a: ["Einen Moment, bitte.", "Einen Augenblick, bitte.", "Einen kleinen Moment, bitte.", "Moment, bitte."] },
    { en: "Say: sorry, we don't have that.", a: ["Das haben wir leider nicht.", "Leider haben wir das nicht.", "Es tut mir leid, das haben wir nicht.", "Entschuldigung, das haben wir nicht.", "Das haben wir nicht.", "Leider nicht."] },
    { en: "Ask for their name (for the cup).", a: ["Wie ist Ihr Name?", "Wie heißen Sie?", "Auf welchen Namen?", "Auf welchen Namen, bitte?", "Wie ist Ihr Name, bitte?"] },
    { en: "Ask if they have already decided.", a: ["Haben Sie schon gewählt?", "Haben Sie sich schon entschieden?", "Wissen Sie schon, was Sie möchten?"] },
    { en: "Thank them and wish them a nice day.", a: ["Danke, schönen Tag noch!", "Vielen Dank, schönen Tag noch!", "Danke, einen schönen Tag noch!", "Vielen Dank, einen schönen Tag noch!", "Danke, einen schönen Tag!", "Danke, schönen Tag!", "Danke schön, schönen Tag noch!"] },
    { en: "Ask what size they want (small or large).", a: ["Klein oder groß?", "Welche Größe?", "Welche Größe möchten Sie?", "Möchten Sie klein oder groß?", "Welche Größe hätten Sie gern?"] },
    { en: "Ask which milk they would like.", a: ["Welche Milch möchten Sie?", "Mit welcher Milch?", "Welche Milch hätten Sie gern?", "Mit welcher Milch möchten Sie das?"] }
  ];

  // ---- the customer asks, you answer ----
  D.reply = [
    { q: "Haben Sie Hafermilch?", en: "Say: yes, we do have it.", a: ["Ja, haben wir.", "Ja, die haben wir.", "Ja, wir haben Hafermilch."] },
    { q: "Haben Sie auch vegane Sachen?", en: "Say: yes, we have vegan options.", a: ["Ja, haben wir.", "Ja, das haben wir.", "Ja, wir haben vegane Optionen.", "Ja, wir haben vegane Sachen."] },
    { q: "Wo ist die Toilette?", en: "Say: the toilet is at the back.", a: ["Die Toilette ist hinten.", "Die Toilette ist dort hinten.", "Die Toilette ist da hinten.", "Dort hinten.", "Da hinten.", "Hinten."] },
    { q: "Gibt es hier WLAN?", en: "Say: yes, there is.", a: ["Ja, gibt es.", "Ja, das gibt es.", "Ja, es gibt WLAN.", "Ja, haben wir.", "Ja, wir haben WLAN."] },
    { q: "Kann ich mit Karte bezahlen?", en: "Say: yes, of course.", a: ["Ja, natürlich.", "Ja, klar.", "Ja, selbstverständlich.", "Ja, gern.", "Ja, das geht.", "Natürlich."] },
    { q: "Wie lange dauert das?", en: "Say: about five minutes.", a: ["Etwa fünf Minuten.", "Ungefähr fünf Minuten.", "Circa fünf Minuten.", "Ca. fünf Minuten.", "Fünf Minuten."] },
    { q: "Was können Sie empfehlen?", en: "Recommend the cappuccino (Akkusativ: den!).", a: ["Ich empfehle den Cappuccino.", "Ich kann den Cappuccino empfehlen.", "Ich würde den Cappuccino empfehlen.", "Den Cappuccino."] },
    { q: "Ist das vegan?", en: "Say: yes, it is vegan.", a: ["Ja, das ist vegan.", "Ja, es ist vegan.", "Ja, ist vegan."] },
    { q: "Haben Sie noch Bagels?", en: "Say: sorry, we have no more.", a: ["Leider haben wir keine mehr.", "Leider nicht mehr.", "Leider keine mehr.", "Nein, leider nicht mehr.", "Nein, leider haben wir keine mehr.", "Es tut mir leid, wir haben keine mehr."] }
  ];

  // ---- article gap (Akkusativ after "Ich hätte gern ___") ----
  D.article = [
    ["Cappuccino", "einen"], ["Espresso", "einen"], ["Tee", "einen"], ["Kaffee", "einen"], ["Bagel", "einen"], ["Chai Latte", "einen"],
    ["heiße Schokolade", "eine"], ["Tasse Tee", "eine"], ["Portion Pancakes", "eine"],
    ["Omelette", "ein"], ["Rührei", "ein"], ["Wasser", "ein"], ["Hummus Brot", "ein"], ["Käsebrot", "ein"]
  ];

  // ---- vocabulary: German -> English (English answers array, first is shown) ----
  D.vocab = [
    ["Rührei", ["scrambled eggs", "scrambled egg"]], ["Spiegelei", ["fried egg", "sunny side up egg"]], ["Brot", ["bread"]],
    ["Lachs", ["salmon"]], ["Räucherlachs", ["smoked salmon"]], ["Hafermilch", ["oat milk"]], ["Sojamilch", ["soy milk", "soya milk"]],
    ["Mandelmilch", ["almond milk"]], ["zum Mitnehmen", ["to go", "takeaway", "take away", "to take away", "takeout"]],
    ["Käse", ["cheese"]], ["Ziegenkäse", ["goat cheese", "goats cheese", "goat's cheese"]], ["Rote Bete", ["beetroot", "beet", "beets", "red beet"]],
    ["Walnuss", ["walnut"]], ["Honig", ["honey"]], ["Champignons", ["mushrooms", "mushroom", "button mushrooms"]],
    ["Kräutersalat", ["herb salad"]], ["Knoblauchwurst", ["garlic sausage"]], ["Marmelade", ["jam", "marmalade"]], ["Joghurt", ["yogurt", "yoghurt"]],
    ["Obst", ["fruit"]], ["Beeren", ["berries"]], ["Gemüse", ["vegetables", "vegetable", "veg", "veggies"]], ["Wurst", ["sausage"]],
    ["Oliven", ["olives", "olive"]], ["Tomaten", ["tomatoes", "tomato"]], ["Paprika", ["bell pepper", "pepper", "capsicum", "paprika"]],
    ["Spinat", ["spinach"]], ["Schnittlauch", ["chives"]], ["Speisekarte", ["menu"]], ["Rechnung", ["bill", "check", "invoice"]],
    ["Trinkgeld", ["tip", "gratuity"]], ["Kasse", ["till", "cash register", "checkout", "register"]], ["bar", ["cash", "in cash"]],
    ["Quittung", ["receipt"]], ["Beleg", ["receipt", "voucher"]], ["Tasse", ["cup", "mug"]], ["Becher", ["cup", "paper cup", "mug"]],
    ["Deckel", ["lid"]], ["Strohhalm", ["straw", "drinking straw"]], ["Serviette", ["napkin"]], ["Löffel", ["spoon"]], ["Gabel", ["fork"]],
    ["Messer", ["knife"]], ["Teller", ["plate"]], ["Zucker", ["sugar"]], ["Karamell", ["caramel"]], ["Haselnuss", ["hazelnut"]],
    ["entkoffeiniert", ["decaf", "decaffeinated", "caffeine free"]], ["heiß", ["hot"]], ["kalt", ["cold"]], ["Wasser", ["water"]],
    ["Eiswürfel", ["ice cubes", "ice cube", "ice"]], ["Frühstück", ["breakfast"]], ["Sahne", ["cream", "whipped cream"]], ["Milch", ["milk"]]
  ];

  // ---- reference: the menu as read from the photos ("–" = could not be read) ----
  D.menuRef = [
    { cat: "Kaffee", items: [["Espresso", "2,80 (doppelt 3,60)"], ["Americano", "3,60"], ["Cortado", "–"], ["Cappuccino", "3,80"], ["Flat White", "–"],
      ["Café Latte", "–"], ["Matcha", "4,90"], ["Heiße Schokolade", "4,90"], ["Iced Coffee Latte", "4,90"], ["Chai Latte", "4,90"]] },
    { cat: "Extras", items: [["Entkoffeiniert (decaf)", "+0,20"], ["Extra Shot", "+1,00"], ["Hafer-, Soja-, Mandelmilch", "+0,40"], ["Sirup: Karamell, Vanille, Haselnuss", "+0,40"]] },
    { cat: "Tee (4,00)", items: [["China Sencha, Mint, Mountain Herb, Earl Grey, Ginger Lemon", "4,00"]] },
    { cat: "Bagels", items: [["Avocado-Cream Cheese", "–"], ["Tomate-Mozzarella-Pesto", "–"], ["Avocado-Hummus", "–"], ["Smoked Salmon-Avocado", "–"]] },
    { cat: "Klassiker", items: [["Pancakes (Obst, Beeren, Banane)", "11,90"], ["French (Croissant, Marmelade, Butter, Joghurt mit Obst)", "7,50"],
      ["Käse Frühstück", "11,50"], ["Mischfrühstück", "12,50"], ["Veganes Frühstück", "12,90"]] },
    { cat: "Brote", items: [["Avocado Brot (2 Spiegeleier)", "9,90"], ["Ziegenkäse Brot", "9,80"], ["Lachs Brot", "11,50"], ["Avocado-Champi", "10,50"],
      ["Käse Brot", "9,20"], ["Gemüse Brot (vegan)", "9,20"], ["Guacamole Brot (vegan)", "9,20"], ["Hummus Brot (vegan)", "9,00"]] },
    { cat: "Eierspeisen", items: [["Rührei Natur (4 Eier)", "8,20"], ["Rührei Bacon / Lachs / Feta", "9,80"], ["Rührei Knoblauchwurst", "10,80"],
      ["Gemüse Omelette", "9,90"], ["Käse Omelette", "9,90"], ["Paprika Omelette", "10,20"], ["Spinat Omelette", "10,50"]] }
  ];

  if (typeof module !== "undefined") module.exports = D; else root.CAFE = D;
})(this);
