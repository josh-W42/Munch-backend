const db = require('./models');

const categories = [ // multiple categories
  { name: 'Breakfast'},
  { name: 'Brunch'}, 
  { name: 'Lunch'},
  { name: 'Dinner'},
  { name: 'Ramen'},
  { name: 'Japanese'}, 
  { name: 'Thai'},
  { name: 'Mexican'},
  { name: 'Vegetarian'},
  { name: 'Vegan'}, 
  { name: 'Halal'},
  { name: 'Mediterranean'},
  { name: 'Italian'},
];

const oneCategory = { name: 'Chinese'}; // single category

const addManyCategories = async () => {
  const savedExamples = await db.Example.insertMany(examples); // creating many categories
  console.log('=======> Saved Many Categories.');
  console.log(savedExamples);
}

const addOneCategory = async () => {
  const savedOneExample = await db.Example.create(oneExample); // creating the one category
  console.log("=======> Saved One Category.");
  console.log(savedOneExample);
};

// run the functions
addManyCategories();
addOneCategory();