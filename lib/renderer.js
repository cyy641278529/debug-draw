import REGL from 'regl';
import {mat4} from 'vmath';
import common from './command/common';
import grid from './command/grid';
import coord from './command/coord';

let m4_a = mat4.create();
let array_m4 = new Float32Array(16);

export default class Renderer {
  constructor (canvasEL) {
    this._canvasEL = canvasEL;
    this._regl = REGL({
      canvas: canvasEL,
      extensions: [
        'webgl_depth_texture',
        'OES_texture_float',
        'OES_texture_float_linear',
        'OES_standard_derivatives'
      ]
    });
    this._uniforms = {};

    // init commands
    this._common = common(this._regl);
    this._drawGrid = grid(this._regl, 100, 100, 100);
    this._drawCoord = coord(this._regl);

    //
    this._nodes = [];
    this._nodesCnt = 0;
  }

  resize() {
    let bcr = this._canvasEL.parentElement.getBoundingClientRect();
    this._canvasEL.width = bcr.width;
    this._canvasEL.height = bcr.height;
  }

  setUniform(name, val) {
    this._uniforms[name] = val;
  }

  drawNode(node) {
    this._nodes[this._nodesCnt] = node;
    this._nodesCnt++;
  }

  frame(cb) {
    this._regl.frame(ctx => {
      this._reset();

      //
      if (cb) {
        cb(ctx);
      }

      // clear contents of the drawing buffer
      this._regl.clear({
        color: [0.3, 0.3, 0.3, 1],
        depth: 1
      });

      // draw
      this._common(this._uniforms, () => {
        for (let i = 0; i < this._nodesCnt; ++i) {
          let node = this._nodes[i];
          node.getWorldMatrix(m4_a);
          mat4.array(array_m4, m4_a);
          this._drawCoord(array_m4);
        }

        // this._drawCoord();
        this._drawGrid();
      });
    });
  }

  _reset() {
    this._nodesCnt = 0;
  }
}