var bag_size = 600;
var width = 4;
var left = 75;
var right = left + bag_size;
var up = 25;
var down = up + bag_size;

function Particle(x, y, id, index) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.index = index;
  this.escaped = false;
}

var particles = [];
var escaped = [];

function stopAll() {
  for (var i = 0; i < particles.length; ++i) {
    clearInterval(particles[i].id);
  }
}

function init() {
  var x = left + 0.5 * bag_size + Math.random();
  var y = up + 0.5 * bag_size + Math.random();
  var index = particles.length;
  id = setInterval(
    function() {
      update(index);
    },
    150);

  var particle = new Particle(x, y, id, index);
  particles.push(particle);
  document.getElementById("demo").innerHtml += "\nAdded new particle " + index;
}

function update(index) {
  var particle = particles[index];
  move(particle);
  draw(particles);
}

function distance_index(distance, index) {
  this.distance = distance;
  this.index = index;
}

function euclidean_distance(item, neighbor) {
  return Math.sqrt(Math.pow(item.x - neighbor.x, 2) + Math.pow(item.y - neighbor.y, 2));
}

function knn(items, index, k) {
  var results =[];
  var item = items[index];
  for (var i = 0; i < items.length; i++) {
    if (i !== index) {
      var neighbor = items[i];
      var distance = euclidean_distance(item, neighbor);
      results.push( new distance_index(distance, i) );
    }
  }
  results.sort( function(a,b) { return a.distance - b.distance; } );
  var top_k = Math.min(k, results.length);
  return results.slice(0, top_k);
}

function move(particle) {
  //first a small random move as before
  //with 5 instead of 50 to force neighbors to dominate
  particle.x += 5 * (Math.random() - 0.5);
  particle.y += 5 * (Math.random() - 0.5);
  var k = Math.min(5, particles.length - 1);//experiment at will
  var items = knn(particles, particle.index, k);
  var x_step = nudge(items, particles, "x");
  particle.x += (x_step - particle.x) * (Math.random() - 0.5);
  var y_step = nudge(items, particles, "y");
  particle.y += (y_step - particle.y) * (Math.random() - 0.5);
}

function nudge(neighbors, positions, property) {
  if (neighbors.length === 0)
    return 0;
  var sum = neighbors.reduce(
    function(sum, item) {
      return sum + positions[item.index][property];
    },
    0);

  return sum / neighbors.length;
}

function draw(particles) {
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#E0B044";
  bag_left = 0;
  bag_top = 0;
  ctx.fillRect(bag_left, bag_top, c.width, c.height);

  var pending = [];
  for (var i = 0; i < particles.length; ++i) {
    if (particles[i].escaped) {
      continue;
    }

    ctx.beginPath();
    ctx.rect(particles[i].x, particles[i].y, 4, 4);
    ctx.strokeStyle = "black";
    ctx.stroke();

    var isInBag = in_bag(particles[i],
      bag_left,
      bag_left + c.width,
      bag_top,
      bag_top + c.height);

    if (!isInBag) {
      document.getElementById("demo").innerHTML += "<br>Success for particle " + i;
      clearInterval(particles[i].id);
      escaped.push(i);
      particles[i].escaped = true;
    }
    else {
      pending.push(i);
    }
  }

  document.getElementById("escaped").innerHTML = "Escaped: " + escaped.join(", ");
  document.getElementById("pending").innerHTML = "Pending:" + pending.join(", ");
  return;
}

function in_bag(particle, left, right, top, bottom) {
  return (particle.x > left) &&
    (particle.x < right) &&
    (particle.y > top) &&
    (particle.y < bottom);
}