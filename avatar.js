'use strict';

// 64x64 skin format http://i.imgur.com/SnDKuc1.png
// based on http://www.reddit.com/r/Minecraft/comments/1vd7ue/new_skin_layout_explanation_in_comments/
var coords = {
  // start x,y - size width,height
  head:       [ 0,  0, 32, 16],
  head2:      [32,  0, 32, 16],

  right_leg:  [ 0, 16, 16, 16],
  body:       [16, 16, 24, 16],
  right_arm:  [40, 16, 16, 16],

  right_leg2: [ 0, 32, 16, 16],
  body2:      [16, 32, 24, 16],
  right_arm2: [40, 32, 16, 16],

  left_leg2:  [ 0, 48, 16, 16],
  left_leg:   [16, 48, 16, 16],
  left_arm:   [32, 48, 16, 16],
  left_arm2:  [48, 48, 16, 16],
};

var uvs = {};

// overall size of skin texture TODO: support old 64x32 (clone left/right)
var total_w = 64;
var total_h = 64;

for (var name in coords) {
  var x = coords[name][0], y = coords[name][1], w = coords[name][2], h = coords[name][3];

  var uv = [
    // top-left
    x / total_w,
    y / total_h,
    (x + w) / total_w,
    (y + h) / total_h
    ];

  uvs[name] = uv;
}

console.log(uvs);

