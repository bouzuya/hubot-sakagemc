
var RandomIndexes = function(length) {
  this.length = length;
  this.array = new Array(length);
};

RandomIndexes.prototype.next = function() {
  if (this.length < 0) {
    return null;
  }
  var index = Math.floor(Math.random() * this.length);
  var result = this.array[index] || index;
  this.array[index] = this.array[this.length - 1] || this.length - 1;
  this.length--;
  return result;
};

module.exports = function(a, n) {
  n = (n > a.length ? a.length : n);
  var random = new RandomIndexes(a.length);
  var result = [];
  for(var i = 0; i < n; i++) {
    result.push(a[random.next()]);
  }
  return result;
};

