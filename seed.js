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
];

const addManyCategories = async () => {
  const savedExamples = await db.Category.insertMany(categories); // creating many categories
  console.log("=======> Saved Many Categories.");
  console.log(savedExamples);
};

const oneCategory = { name: "Chinese" }; // single category

const addOneCategory = async () => {
  const savedOneExample = await db.Category.create(oneCategory); // creating the one category
  console.log("=======> Saved One Category.");
  console.log(savedOneExample);
};

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

const addOneRestaurant = async () => {
  const savedOneRestaurant = await db.Restaurant.create(oneRestaurant);
  const japanese = await db.Category.findOne({name: "Japanese"})
  savedOneRestaurant.category = japanese
  savedOneRestaurant.save();
  console.log("============> Restaurant was added to the database")
  console.log(savedOneRestaurant)
};

// Trie stuff.

const createTrie = () => {
  let start = new Date();
  // first store all the categories in the trie
  const myTrie = new Trie();
  for (let category of categories) {
    myTrie.addWord(category.name, 'category');
  }

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
  // addOneCategory();
  // addOneRestaurant();
}

init();

module.exports = {
  Trie: createTrie()
}


