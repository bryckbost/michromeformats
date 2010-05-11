HRecipe = Microformat.define('hrecipe', {
  one : ['fn', 'yield', 'instructions', 'summary', 'published'],
  many : ['ingredient', 'duration', { 'photo' : 'url' }, 'author', 'nutrition', 'tag']
});
