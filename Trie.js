class Node {
  constructor(data) {
    this.data = data;
    this.children = new Map();
    this.isWord = false;
    this.type = null;
  }
}

class Trie {
  constructor() {
    this.head = new Node(null);
  }

  addWord(word, type) {
    let currentNode = this.head;

    // add all letters of a word into various hash maps
    for (let letter of word) {
      if (currentNode.children.has(letter)) {
        currentNode = currentNode.children.get(letter);
      } else {
        let newNode = new Node(letter);
        currentNode.children.set(letter, newNode);
        currentNode = newNode;
      }
    }
    // lastly, set the status of the last node as a word ending.
    currentNode.isWord = true;
    currentNode.type = type;
  }

  deleteWord(word) {
    let currentNode = this.head;

    // add all letters of a word into various hash maps
    for (let letter of word) {
      if (currentNode.children.get(letter)) {
        currentNode = currentNode.children.get(letter);
      }
    }
    // lastly, set the status of the last node as not a word ending.
    currentNode.isWord = false;
  }

  findSuffixes(prefix) {
    if (!prefix || typeof prefix !== "string") {
      return -1;
    }

    let currentNode = this.head;
    // Ok first we have to search the prefix
    for (let letter of prefix) {
      if (currentNode.children.has(letter)) {
        currentNode = currentNode.children.get(letter);
      } else {
        // If we can't find any data on the prefix, we exit.
        return -1;
      }
    }

    const results = [];

    // We want to return the word even if there's nothing following it.
    if (currentNode.isWord) {
      results.push({ word: prefix, type: currentNode.type });
    }

    // by this point we have to recursively search from the prefix to find all suffixes.
    const findRest = (node, chain) => {
      if (node.children.size === 0) {
        return;
      }
      node.children.forEach((node, key) => {
        if (node.isWord) {
          results.push({ word: chain + key, type: node.type });
        }
        findRest(node, chain + key);
      });
    };
    findRest(currentNode, prefix);
    // what's returned is actually the full words found in the trie.
    return results;
  }
}

module.exports = Trie;
