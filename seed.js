const { restaurant } = require("./controllers");
const db = require("./models");
const Trie = require('./Trie');

const categories = [
  // multiple categories
  { name: "breakfast", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615492619/fried-egg_a28qsd.png" },
  { name: "brunch", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615492669/cocktail_f9eb9c.png" },
  { name: "lunch", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493643/cheeseburger_ugql4l.png" },
  { name: "dinner", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493350/food-tray_azcja1.png" },
  { name: "ramen", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615492635/ramen_gqml0y.png" },
  { name: "japanese", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615492661/onigiri_cgfvga.png" },
  { name: "thai", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493359/curry_cbxvke.png" },
  { name: "mexican", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615492648/taco_qfobgo.png" },
  { name: "vegetarian", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493595/carrot_xwimty.png" },
  { name: "vegan", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493194/salad_1_a8ekmc.png" },
  { name: "halal", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493185/falafel_misghn.png" },
  { name: "mediterranean", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493496/sandwich_kdw1yu.png" },
  { name: "italian", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615493545/pasta_u66jrx.png" },
  { name: "chinese", picture: "https://res.cloudinary.com/dom5vocai/image/upload/v1615537862/chinese-food_hr4i8q.png" },
];

const addManyCategories = async () => {
  try {
    const savedExamples = await db.Category.insertMany(categories); // creating many categories  
    console.log("=======> Saved Many Categories.");
  } catch (error) {
    console.error(error);
  }
  // console.log(savedExamples);
};

// const oneCategory = { name: "Chinese" }; // single category

// const addOneCategory = async () => {
//   try {
//     const savedOneExample = await db.Category.create(oneCategory); // creating the one category
//     console.log("=======> Saved One Category.");
//   } catch (error) {
//     // Dont worry
//   }
//   // console.log(savedOneExample);
// };

// HARD CODED RESTAURANTS DATA
const oneRestaurant = {
  name: `Shin-Sen-Gumi`,
  email: "ShinSenGumi@gmail.com",
  password: "password",
  profileUrl: "https://res.cloudinary.com/dom5vocai/image/upload/v1614931585/oi0yvlmmt9xtoxzzpj5t.jpg",
  menu: [
    {
      name: "Tonkotsu Ramen",
      description: "Pork broth ramen w/ shaschu",
      price: 13,
      type: "Ramen",
    },
    {
      name: "Shoyu Ramen",
      description: "Soy based ramen made with chicken",
      price: 13,
      type: "Ramen",
    },
    {
      name: "Chicken Karage",
      description: "Deep fried chicken with special sauce",
      price: 8,
      type: "Sides",
    },
  ],
};

const joshBobBurger = {
  name: `Josh's Burgers`,
  email: 'joshuaBurgers@gmail.com',
  password: "password",
  profileUrl: "https://assets.bonappetit.com/photos/5a33fb9b7d4b9b484283f0cd/master/pass/bobs-burgers-restaurant.jpg",
  menu: [
    {
      name: "Josh's Burger",
      description: "A classic. This burger almost tastes unreal",
      price: 5,
      type: "Classic"
    },
    {
      name: "Burger of the Day",
      description: "Shes a super leek burger",
      price: 6,
      type: "Special"
    },
    {
      name: "Side Salad",
      description: "Its GREEEN!",
      price: 2,
      type: "Sides"
    },
    {
      name: "Soda",
      description: "Coca Cola Products",
      price: 1,
      type: "Drinks"
    },
  ]
}

const nelsonTipico = {
  name: `Nelson's Tipico`,
  email: 'nelsonstipico@gmail.com',
  password: "password",
  profileUrl: "https://images.unsplash.com/photo-1613478549952-47b2db19e194?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2550&q=80",
  menu: [
    {
      name: "Nelson's Plate",
      description: "A full on festive experience, featuring asada, mexican rice, beans, served with a side of fresh tortillas. ",
      price: 12,
      type: "Main"
    },
    {
      name: "Spaghetti Tacos",
      description: "A homage to iCarly's iconic italian mexican fusion",
      price: 2,
      type: "Tacos"
    },
    {
      name: "Pozole Lovers",
      description: "Where do pozole lovers go to meet? E Hominy",
      price: 10,
      type: "Soups"
    },
    {
      name: "Guacamole",
      description: "What did the tortilla chip say to the avocado? Well, this is guacward...",
      price: 2,
      type: "Sides"
    },
  ]
}
const andrewCityWok = {
  name: `Andrew's City Wok`,
  email: 'cityWok@gmail.com',
  password: "password",
  profileUrl: "https://southparkstudios.mtvnimages.com/shared/locations/city-wok.jpg",
  menu: [
    {
      name: "City Mongolian Beef",
      description: "Mongorian beef made to order",
      price: 10,
      type: "Main"
    },
    {
      name: "Super Spicy City Shrimp",
      description: "Hot hot hot hot hot hot",
      price: 10,
      type: "Seafood"
    },
    {
      name: "Combo A",
      description: "One choice of main dish, no fortune cookie",
      price: 10,
      type: "Soups"
    },
    {
      name: "Combo C",
      description: "No combo B. You order combo C and it comes with fortune cookie.",
      price: 12,
      type: "Combo"
    },
  ]
}
const jamesSurfandTurn = {
  name: `James Surf and Turn`,
  email: 'jamesSurf@gmail.com',
  password: "password",
  profileUrl: "https://images.unsplash.com/photo-1610989569147-a7699a437bac?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1649&q=80",
  menu: [
    {
      name: "Sinkler's Surf and Turf",
      description: "Radical Shrimp and Steak Combo",
      price: 20,
      type: "Main"
    },
    {
      name: "Baja Bumble Bee Burritos",
      description: "Made from the nector of my archnemisis. LIMITED QUANTITY",
      price: 100,
      type: "Specials"
    },
  ]
}
const romeItalian = {
  name: `Rome's Italian`,
  email: 'romesItalian@gmail.com',
  password: "password",
  profileUrl: "https://images.unsplash.com/photo-1553342385-111fd6bc6ab3?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80",
  menu: [
    {
      name: "Stuffed Rome Bellpeppers",
      description: "A Rome specialty",
      price: 12,
      type: "Main"
    },
    {
      name: "The Fresh Pizza of Bell-Air",
      description: "Pizza so good, you will remember the playground where you spent most of your days...",
      price: 15,
      type: "Pizza"
    },
  ]
}
const briansCrabShack = {
  name: `Brian's KrabShack`,
  email: 'briansCrabShack@gmail.com',
  password: "password",
  profileUrl: "https://images.unsplash.com/photo-1559814048-149b70765d47?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80",
  menu: [
    {
      name: "Brian's Krab-ec legs",
      description: "Served with homemade garlic butter",
      price: 20,
      type: "Seafood"
    },
    {
      name: "Aileron's Catch",
      description: "her catch of the day, served fresh",
      price: 10,
      type: "Special"
    },
  ]
}
const nicksIceCream = {
  name: `Nick's IceCream Shop`,
  email: 'nicksIceCream@gmail.com',
  password: "password",
  profileUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80",
  menu: [
    {
      name: "Ice Cream Schmunday",
      description: "The Nick Schmitt Special",
      price: 8,
      type: "Special"
    },
    {
      name: "Schmurda Scoop",
      description: "Bobby approved",
      price: 5,
      type: "Special"
    },
  ]
}

//*****************************/

const addOneRestaurant = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(oneRestaurant);
    const japanese = await db.Category.findOne({name: "japanese"});
    savedOneRestaurant.category = japanese;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addNelsons = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(nelsonTipico);
    const mexican = await db.Category.findOne({name: "mexican"});
    savedOneRestaurant.category = mexican;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addJoshs = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(joshBobBurger);
    const lunch = await db.Category.findOne({name: "lunch"});
    savedOneRestaurant.category = lunch;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addAndrews = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(andrewCityWok);
    const chinese = await db.Category.findOne({name: "chinese"});
    savedOneRestaurant.category = chinese;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addJames = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(jamesSurfandTurn);
    const dinner = await db.Category.findOne({name: "dinner"});
    savedOneRestaurant.category = dinner;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addRome = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(romeItalian);
    const italian = await db.Category.findOne({name: "italian"});
    savedOneRestaurant.category = italian;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addBrian = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(briansCrabShack);
    const lunch = await db.Category.findOne({name: "lunch"});
    savedOneRestaurant.category = lunch;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};
const addNick = async () => {
  try {
    const savedOneRestaurant = await db.Restaurant.create(nicksIceCream);
    const vegan = await db.Category.findOne({name: "vegan"});
    savedOneRestaurant.category = vegan;
    savedOneRestaurant.save();
    console.log("============> Restaurant was added to the database");
  } catch (error) {
    // Dont worry
  }
  // console.log(savedOneRestaurant)
};







// Trie stuff.

const createTrie = () => {
  let start = new Date();
  // first store all the categories in the trie
  const myTrie = new Trie();
  for (let category of categories) {
    myTrie.addWord(category.name.toLowerCase(), 'category');
  }

  // Then the users
  db.User.find({})
  .then(users => {
    users.forEach(user => {
      myTrie.addWord(user.userName.toLowerCase(), "user");
    });
  })
  .catch(error => {
    console.error(error);
  });

  // Now store all restaurants
  db.Restaurant.find({})
  .then(restaurants => {
    restaurants.forEach(restaurant => {
      myTrie.addWord(restaurant.name.toLowerCase(), 'restaurant');
    });
  })
  .catch(error => {
    console.error(error);
  });

  let end = new Date();
  let timeDifference = new Date(end - start);;
  
  console.log(`Added every phrase in ${timeDifference.getMilliseconds()} ms`);
  return myTrie
}

const init = async () => {

  // Add categories if none are present in DB.
  try {
    const categories = await db.Category.find({});
    
    if (categories.length < 1) {
      addManyCategories();
    }
  } catch (error) {
    console.error(error);
  }
  
  // >>>>>>>> run the functions if needed <<<<<<<<<<<
  try {
    addOneRestaurant();
    addNelsons();
    addJoshs();
    addAndrews();
    addJames();
    addRome();
    addBrian();
    addNick();
  } catch (error) {
    // Don't Worry About it.
  }
  // addOneCategory();
}

init();

module.exports = {
  Trie: createTrie()
}


