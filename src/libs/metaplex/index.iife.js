var metaplex = (function (exports, web3_js, splToken) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var lib = {};

	var bn = {exports: {}};

	var _nodeResolve_empty = {};

	var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': _nodeResolve_empty
	});

	var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(_nodeResolve_empty$1);

	(function (module) {
	(function (module, exports) {

	  // Utils
	  function assert (val, msg) {
	    if (!val) throw new Error(msg || 'Assertion failed');
	  }

	  // Could use `inherits` module, but don't want to move from single file
	  // architecture yet.
	  function inherits (ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  }

	  // BN

	  function BN (number, base, endian) {
	    if (BN.isBN(number)) {
	      return number;
	    }

	    this.negative = 0;
	    this.words = null;
	    this.length = 0;

	    // Reduction context
	    this.red = null;

	    if (number !== null) {
	      if (base === 'le' || base === 'be') {
	        endian = base;
	        base = 10;
	      }

	      this._init(number || 0, base || 10, endian || 'be');
	    }
	  }
	  if (typeof module === 'object') {
	    module.exports = BN;
	  } else {
	    exports.BN = BN;
	  }

	  BN.BN = BN;
	  BN.wordSize = 26;

	  var Buffer;
	  try {
	    if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
	      Buffer = window.Buffer;
	    } else {
	      Buffer = require$$0$1.Buffer;
	    }
	  } catch (e) {
	  }

	  BN.isBN = function isBN (num) {
	    if (num instanceof BN) {
	      return true;
	    }

	    return num !== null && typeof num === 'object' &&
	      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
	  };

	  BN.max = function max (left, right) {
	    if (left.cmp(right) > 0) return left;
	    return right;
	  };

	  BN.min = function min (left, right) {
	    if (left.cmp(right) < 0) return left;
	    return right;
	  };

	  BN.prototype._init = function init (number, base, endian) {
	    if (typeof number === 'number') {
	      return this._initNumber(number, base, endian);
	    }

	    if (typeof number === 'object') {
	      return this._initArray(number, base, endian);
	    }

	    if (base === 'hex') {
	      base = 16;
	    }
	    assert(base === (base | 0) && base >= 2 && base <= 36);

	    number = number.toString().replace(/\s+/g, '');
	    var start = 0;
	    if (number[0] === '-') {
	      start++;
	      this.negative = 1;
	    }

	    if (start < number.length) {
	      if (base === 16) {
	        this._parseHex(number, start, endian);
	      } else {
	        this._parseBase(number, base, start);
	        if (endian === 'le') {
	          this._initArray(this.toArray(), base, endian);
	        }
	      }
	    }
	  };

	  BN.prototype._initNumber = function _initNumber (number, base, endian) {
	    if (number < 0) {
	      this.negative = 1;
	      number = -number;
	    }
	    if (number < 0x4000000) {
	      this.words = [number & 0x3ffffff];
	      this.length = 1;
	    } else if (number < 0x10000000000000) {
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff
	      ];
	      this.length = 2;
	    } else {
	      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
	      this.words = [
	        number & 0x3ffffff,
	        (number / 0x4000000) & 0x3ffffff,
	        1
	      ];
	      this.length = 3;
	    }

	    if (endian !== 'le') return;

	    // Reverse the bytes
	    this._initArray(this.toArray(), base, endian);
	  };

	  BN.prototype._initArray = function _initArray (number, base, endian) {
	    // Perhaps a Uint8Array
	    assert(typeof number.length === 'number');
	    if (number.length <= 0) {
	      this.words = [0];
	      this.length = 1;
	      return this;
	    }

	    this.length = Math.ceil(number.length / 3);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    var j, w;
	    var off = 0;
	    if (endian === 'be') {
	      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
	        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    } else if (endian === 'le') {
	      for (i = 0, j = 0; i < number.length; i += 3) {
	        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
	        this.words[j] |= (w << off) & 0x3ffffff;
	        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
	        off += 24;
	        if (off >= 26) {
	          off -= 26;
	          j++;
	        }
	      }
	    }
	    return this._strip();
	  };

	  function parseHex4Bits (string, index) {
	    var c = string.charCodeAt(index);
	    // '0' - '9'
	    if (c >= 48 && c <= 57) {
	      return c - 48;
	    // 'A' - 'F'
	    } else if (c >= 65 && c <= 70) {
	      return c - 55;
	    // 'a' - 'f'
	    } else if (c >= 97 && c <= 102) {
	      return c - 87;
	    } else {
	      assert(false, 'Invalid character in ' + string);
	    }
	  }

	  function parseHexByte (string, lowerBound, index) {
	    var r = parseHex4Bits(string, index);
	    if (index - 1 >= lowerBound) {
	      r |= parseHex4Bits(string, index - 1) << 4;
	    }
	    return r;
	  }

	  BN.prototype._parseHex = function _parseHex (number, start, endian) {
	    // Create possibly bigger array to ensure that it fits the number
	    this.length = Math.ceil((number.length - start) / 6);
	    this.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      this.words[i] = 0;
	    }

	    // 24-bits chunks
	    var off = 0;
	    var j = 0;

	    var w;
	    if (endian === 'be') {
	      for (i = number.length - 1; i >= start; i -= 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    } else {
	      var parseLength = number.length - start;
	      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
	        w = parseHexByte(number, start, i) << off;
	        this.words[j] |= w & 0x3ffffff;
	        if (off >= 18) {
	          off -= 18;
	          j += 1;
	          this.words[j] |= w >>> 26;
	        } else {
	          off += 8;
	        }
	      }
	    }

	    this._strip();
	  };

	  function parseBase (str, start, end, mul) {
	    var r = 0;
	    var b = 0;
	    var len = Math.min(str.length, end);
	    for (var i = start; i < len; i++) {
	      var c = str.charCodeAt(i) - 48;

	      r *= mul;

	      // 'a'
	      if (c >= 49) {
	        b = c - 49 + 0xa;

	      // 'A'
	      } else if (c >= 17) {
	        b = c - 17 + 0xa;

	      // '0' - '9'
	      } else {
	        b = c;
	      }
	      assert(c >= 0 && b < mul, 'Invalid character');
	      r += b;
	    }
	    return r;
	  }

	  BN.prototype._parseBase = function _parseBase (number, base, start) {
	    // Initialize as zero
	    this.words = [0];
	    this.length = 1;

	    // Find length of limb in base
	    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
	      limbLen++;
	    }
	    limbLen--;
	    limbPow = (limbPow / base) | 0;

	    var total = number.length - start;
	    var mod = total % limbLen;
	    var end = Math.min(total, total - mod) + start;

	    var word = 0;
	    for (var i = start; i < end; i += limbLen) {
	      word = parseBase(number, i, i + limbLen, base);

	      this.imuln(limbPow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    if (mod !== 0) {
	      var pow = 1;
	      word = parseBase(number, i, number.length, base);

	      for (i = 0; i < mod; i++) {
	        pow *= base;
	      }

	      this.imuln(pow);
	      if (this.words[0] + word < 0x4000000) {
	        this.words[0] += word;
	      } else {
	        this._iaddn(word);
	      }
	    }

	    this._strip();
	  };

	  BN.prototype.copy = function copy (dest) {
	    dest.words = new Array(this.length);
	    for (var i = 0; i < this.length; i++) {
	      dest.words[i] = this.words[i];
	    }
	    dest.length = this.length;
	    dest.negative = this.negative;
	    dest.red = this.red;
	  };

	  function move (dest, src) {
	    dest.words = src.words;
	    dest.length = src.length;
	    dest.negative = src.negative;
	    dest.red = src.red;
	  }

	  BN.prototype._move = function _move (dest) {
	    move(dest, this);
	  };

	  BN.prototype.clone = function clone () {
	    var r = new BN(null);
	    this.copy(r);
	    return r;
	  };

	  BN.prototype._expand = function _expand (size) {
	    while (this.length < size) {
	      this.words[this.length++] = 0;
	    }
	    return this;
	  };

	  // Remove leading `0` from `this`
	  BN.prototype._strip = function strip () {
	    while (this.length > 1 && this.words[this.length - 1] === 0) {
	      this.length--;
	    }
	    return this._normSign();
	  };

	  BN.prototype._normSign = function _normSign () {
	    // -0 = 0
	    if (this.length === 1 && this.words[0] === 0) {
	      this.negative = 0;
	    }
	    return this;
	  };

	  // Check Symbol.for because not everywhere where Symbol defined
	  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Browser_compatibility
	  if (typeof Symbol !== 'undefined' && typeof Symbol.for === 'function') {
	    try {
	      BN.prototype[Symbol.for('nodejs.util.inspect.custom')] = inspect;
	    } catch (e) {
	      BN.prototype.inspect = inspect;
	    }
	  } else {
	    BN.prototype.inspect = inspect;
	  }

	  function inspect () {
	    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
	  }

	  /*

	  var zeros = [];
	  var groupSizes = [];
	  var groupBases = [];

	  var s = '';
	  var i = -1;
	  while (++i < BN.wordSize) {
	    zeros[i] = s;
	    s += '0';
	  }
	  groupSizes[0] = 0;
	  groupSizes[1] = 0;
	  groupBases[0] = 0;
	  groupBases[1] = 0;
	  var base = 2 - 1;
	  while (++base < 36 + 1) {
	    var groupSize = 0;
	    var groupBase = 1;
	    while (groupBase < (1 << BN.wordSize) / base) {
	      groupBase *= base;
	      groupSize += 1;
	    }
	    groupSizes[base] = groupSize;
	    groupBases[base] = groupBase;
	  }

	  */

	  var zeros = [
	    '',
	    '0',
	    '00',
	    '000',
	    '0000',
	    '00000',
	    '000000',
	    '0000000',
	    '00000000',
	    '000000000',
	    '0000000000',
	    '00000000000',
	    '000000000000',
	    '0000000000000',
	    '00000000000000',
	    '000000000000000',
	    '0000000000000000',
	    '00000000000000000',
	    '000000000000000000',
	    '0000000000000000000',
	    '00000000000000000000',
	    '000000000000000000000',
	    '0000000000000000000000',
	    '00000000000000000000000',
	    '000000000000000000000000',
	    '0000000000000000000000000'
	  ];

	  var groupSizes = [
	    0, 0,
	    25, 16, 12, 11, 10, 9, 8,
	    8, 7, 7, 7, 7, 6, 6,
	    6, 6, 6, 6, 6, 5, 5,
	    5, 5, 5, 5, 5, 5, 5,
	    5, 5, 5, 5, 5, 5, 5
	  ];

	  var groupBases = [
	    0, 0,
	    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
	    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
	    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
	    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
	    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
	  ];

	  BN.prototype.toString = function toString (base, padding) {
	    base = base || 10;
	    padding = padding | 0 || 1;

	    var out;
	    if (base === 16 || base === 'hex') {
	      out = '';
	      var off = 0;
	      var carry = 0;
	      for (var i = 0; i < this.length; i++) {
	        var w = this.words[i];
	        var word = (((w << off) | carry) & 0xffffff).toString(16);
	        carry = (w >>> (24 - off)) & 0xffffff;
	        if (carry !== 0 || i !== this.length - 1) {
	          out = zeros[6 - word.length] + word + out;
	        } else {
	          out = word + out;
	        }
	        off += 2;
	        if (off >= 26) {
	          off -= 26;
	          i--;
	        }
	      }
	      if (carry !== 0) {
	        out = carry.toString(16) + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    if (base === (base | 0) && base >= 2 && base <= 36) {
	      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
	      var groupSize = groupSizes[base];
	      // var groupBase = Math.pow(base, groupSize);
	      var groupBase = groupBases[base];
	      out = '';
	      var c = this.clone();
	      c.negative = 0;
	      while (!c.isZero()) {
	        var r = c.modrn(groupBase).toString(base);
	        c = c.idivn(groupBase);

	        if (!c.isZero()) {
	          out = zeros[groupSize - r.length] + r + out;
	        } else {
	          out = r + out;
	        }
	      }
	      if (this.isZero()) {
	        out = '0' + out;
	      }
	      while (out.length % padding !== 0) {
	        out = '0' + out;
	      }
	      if (this.negative !== 0) {
	        out = '-' + out;
	      }
	      return out;
	    }

	    assert(false, 'Base should be between 2 and 36');
	  };

	  BN.prototype.toNumber = function toNumber () {
	    var ret = this.words[0];
	    if (this.length === 2) {
	      ret += this.words[1] * 0x4000000;
	    } else if (this.length === 3 && this.words[2] === 0x01) {
	      // NOTE: at this stage it is known that the top bit is set
	      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
	    } else if (this.length > 2) {
	      assert(false, 'Number can only safely store up to 53 bits');
	    }
	    return (this.negative !== 0) ? -ret : ret;
	  };

	  BN.prototype.toJSON = function toJSON () {
	    return this.toString(16, 2);
	  };

	  if (Buffer) {
	    BN.prototype.toBuffer = function toBuffer (endian, length) {
	      return this.toArrayLike(Buffer, endian, length);
	    };
	  }

	  BN.prototype.toArray = function toArray (endian, length) {
	    return this.toArrayLike(Array, endian, length);
	  };

	  var allocate = function allocate (ArrayType, size) {
	    if (ArrayType.allocUnsafe) {
	      return ArrayType.allocUnsafe(size);
	    }
	    return new ArrayType(size);
	  };

	  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
	    this._strip();

	    var byteLength = this.byteLength();
	    var reqLength = length || Math.max(1, byteLength);
	    assert(byteLength <= reqLength, 'byte array longer than desired length');
	    assert(reqLength > 0, 'Requested array length <= 0');

	    var res = allocate(ArrayType, reqLength);
	    var postfix = endian === 'le' ? 'LE' : 'BE';
	    this['_toArrayLike' + postfix](res, byteLength);
	    return res;
	  };

	  BN.prototype._toArrayLikeLE = function _toArrayLikeLE (res, byteLength) {
	    var position = 0;
	    var carry = 0;

	    for (var i = 0, shift = 0; i < this.length; i++) {
	      var word = (this.words[i] << shift) | carry;

	      res[position++] = word & 0xff;
	      if (position < res.length) {
	        res[position++] = (word >> 8) & 0xff;
	      }
	      if (position < res.length) {
	        res[position++] = (word >> 16) & 0xff;
	      }

	      if (shift === 6) {
	        if (position < res.length) {
	          res[position++] = (word >> 24) & 0xff;
	        }
	        carry = 0;
	        shift = 0;
	      } else {
	        carry = word >>> 24;
	        shift += 2;
	      }
	    }

	    if (position < res.length) {
	      res[position++] = carry;

	      while (position < res.length) {
	        res[position++] = 0;
	      }
	    }
	  };

	  BN.prototype._toArrayLikeBE = function _toArrayLikeBE (res, byteLength) {
	    var position = res.length - 1;
	    var carry = 0;

	    for (var i = 0, shift = 0; i < this.length; i++) {
	      var word = (this.words[i] << shift) | carry;

	      res[position--] = word & 0xff;
	      if (position >= 0) {
	        res[position--] = (word >> 8) & 0xff;
	      }
	      if (position >= 0) {
	        res[position--] = (word >> 16) & 0xff;
	      }

	      if (shift === 6) {
	        if (position >= 0) {
	          res[position--] = (word >> 24) & 0xff;
	        }
	        carry = 0;
	        shift = 0;
	      } else {
	        carry = word >>> 24;
	        shift += 2;
	      }
	    }

	    if (position >= 0) {
	      res[position--] = carry;

	      while (position >= 0) {
	        res[position--] = 0;
	      }
	    }
	  };

	  if (Math.clz32) {
	    BN.prototype._countBits = function _countBits (w) {
	      return 32 - Math.clz32(w);
	    };
	  } else {
	    BN.prototype._countBits = function _countBits (w) {
	      var t = w;
	      var r = 0;
	      if (t >= 0x1000) {
	        r += 13;
	        t >>>= 13;
	      }
	      if (t >= 0x40) {
	        r += 7;
	        t >>>= 7;
	      }
	      if (t >= 0x8) {
	        r += 4;
	        t >>>= 4;
	      }
	      if (t >= 0x02) {
	        r += 2;
	        t >>>= 2;
	      }
	      return r + t;
	    };
	  }

	  BN.prototype._zeroBits = function _zeroBits (w) {
	    // Short-cut
	    if (w === 0) return 26;

	    var t = w;
	    var r = 0;
	    if ((t & 0x1fff) === 0) {
	      r += 13;
	      t >>>= 13;
	    }
	    if ((t & 0x7f) === 0) {
	      r += 7;
	      t >>>= 7;
	    }
	    if ((t & 0xf) === 0) {
	      r += 4;
	      t >>>= 4;
	    }
	    if ((t & 0x3) === 0) {
	      r += 2;
	      t >>>= 2;
	    }
	    if ((t & 0x1) === 0) {
	      r++;
	    }
	    return r;
	  };

	  // Return number of used bits in a BN
	  BN.prototype.bitLength = function bitLength () {
	    var w = this.words[this.length - 1];
	    var hi = this._countBits(w);
	    return (this.length - 1) * 26 + hi;
	  };

	  function toBitArray (num) {
	    var w = new Array(num.bitLength());

	    for (var bit = 0; bit < w.length; bit++) {
	      var off = (bit / 26) | 0;
	      var wbit = bit % 26;

	      w[bit] = (num.words[off] >>> wbit) & 0x01;
	    }

	    return w;
	  }

	  // Number of trailing zero bits
	  BN.prototype.zeroBits = function zeroBits () {
	    if (this.isZero()) return 0;

	    var r = 0;
	    for (var i = 0; i < this.length; i++) {
	      var b = this._zeroBits(this.words[i]);
	      r += b;
	      if (b !== 26) break;
	    }
	    return r;
	  };

	  BN.prototype.byteLength = function byteLength () {
	    return Math.ceil(this.bitLength() / 8);
	  };

	  BN.prototype.toTwos = function toTwos (width) {
	    if (this.negative !== 0) {
	      return this.abs().inotn(width).iaddn(1);
	    }
	    return this.clone();
	  };

	  BN.prototype.fromTwos = function fromTwos (width) {
	    if (this.testn(width - 1)) {
	      return this.notn(width).iaddn(1).ineg();
	    }
	    return this.clone();
	  };

	  BN.prototype.isNeg = function isNeg () {
	    return this.negative !== 0;
	  };

	  // Return negative clone of `this`
	  BN.prototype.neg = function neg () {
	    return this.clone().ineg();
	  };

	  BN.prototype.ineg = function ineg () {
	    if (!this.isZero()) {
	      this.negative ^= 1;
	    }

	    return this;
	  };

	  // Or `num` with `this` in-place
	  BN.prototype.iuor = function iuor (num) {
	    while (this.length < num.length) {
	      this.words[this.length++] = 0;
	    }

	    for (var i = 0; i < num.length; i++) {
	      this.words[i] = this.words[i] | num.words[i];
	    }

	    return this._strip();
	  };

	  BN.prototype.ior = function ior (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuor(num);
	  };

	  // Or `num` with `this`
	  BN.prototype.or = function or (num) {
	    if (this.length > num.length) return this.clone().ior(num);
	    return num.clone().ior(this);
	  };

	  BN.prototype.uor = function uor (num) {
	    if (this.length > num.length) return this.clone().iuor(num);
	    return num.clone().iuor(this);
	  };

	  // And `num` with `this` in-place
	  BN.prototype.iuand = function iuand (num) {
	    // b = min-length(num, this)
	    var b;
	    if (this.length > num.length) {
	      b = num;
	    } else {
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = this.words[i] & num.words[i];
	    }

	    this.length = b.length;

	    return this._strip();
	  };

	  BN.prototype.iand = function iand (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuand(num);
	  };

	  // And `num` with `this`
	  BN.prototype.and = function and (num) {
	    if (this.length > num.length) return this.clone().iand(num);
	    return num.clone().iand(this);
	  };

	  BN.prototype.uand = function uand (num) {
	    if (this.length > num.length) return this.clone().iuand(num);
	    return num.clone().iuand(this);
	  };

	  // Xor `num` with `this` in-place
	  BN.prototype.iuxor = function iuxor (num) {
	    // a.length > b.length
	    var a;
	    var b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    for (var i = 0; i < b.length; i++) {
	      this.words[i] = a.words[i] ^ b.words[i];
	    }

	    if (this !== a) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = a.length;

	    return this._strip();
	  };

	  BN.prototype.ixor = function ixor (num) {
	    assert((this.negative | num.negative) === 0);
	    return this.iuxor(num);
	  };

	  // Xor `num` with `this`
	  BN.prototype.xor = function xor (num) {
	    if (this.length > num.length) return this.clone().ixor(num);
	    return num.clone().ixor(this);
	  };

	  BN.prototype.uxor = function uxor (num) {
	    if (this.length > num.length) return this.clone().iuxor(num);
	    return num.clone().iuxor(this);
	  };

	  // Not ``this`` with ``width`` bitwidth
	  BN.prototype.inotn = function inotn (width) {
	    assert(typeof width === 'number' && width >= 0);

	    var bytesNeeded = Math.ceil(width / 26) | 0;
	    var bitsLeft = width % 26;

	    // Extend the buffer with leading zeroes
	    this._expand(bytesNeeded);

	    if (bitsLeft > 0) {
	      bytesNeeded--;
	    }

	    // Handle complete words
	    for (var i = 0; i < bytesNeeded; i++) {
	      this.words[i] = ~this.words[i] & 0x3ffffff;
	    }

	    // Handle the residue
	    if (bitsLeft > 0) {
	      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
	    }

	    // And remove leading zeroes
	    return this._strip();
	  };

	  BN.prototype.notn = function notn (width) {
	    return this.clone().inotn(width);
	  };

	  // Set `bit` of `this`
	  BN.prototype.setn = function setn (bit, val) {
	    assert(typeof bit === 'number' && bit >= 0);

	    var off = (bit / 26) | 0;
	    var wbit = bit % 26;

	    this._expand(off + 1);

	    if (val) {
	      this.words[off] = this.words[off] | (1 << wbit);
	    } else {
	      this.words[off] = this.words[off] & ~(1 << wbit);
	    }

	    return this._strip();
	  };

	  // Add `num` to `this` in-place
	  BN.prototype.iadd = function iadd (num) {
	    var r;

	    // negative + positive
	    if (this.negative !== 0 && num.negative === 0) {
	      this.negative = 0;
	      r = this.isub(num);
	      this.negative ^= 1;
	      return this._normSign();

	    // positive + negative
	    } else if (this.negative === 0 && num.negative !== 0) {
	      num.negative = 0;
	      r = this.isub(num);
	      num.negative = 1;
	      return r._normSign();
	    }

	    // a.length > b.length
	    var a, b;
	    if (this.length > num.length) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      this.words[i] = r & 0x3ffffff;
	      carry = r >>> 26;
	    }

	    this.length = a.length;
	    if (carry !== 0) {
	      this.words[this.length] = carry;
	      this.length++;
	    // Copy the rest of the words
	    } else if (a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    return this;
	  };

	  // Add `num` to `this`
	  BN.prototype.add = function add (num) {
	    var res;
	    if (num.negative !== 0 && this.negative === 0) {
	      num.negative = 0;
	      res = this.sub(num);
	      num.negative ^= 1;
	      return res;
	    } else if (num.negative === 0 && this.negative !== 0) {
	      this.negative = 0;
	      res = num.sub(this);
	      this.negative = 1;
	      return res;
	    }

	    if (this.length > num.length) return this.clone().iadd(num);

	    return num.clone().iadd(this);
	  };

	  // Subtract `num` from `this` in-place
	  BN.prototype.isub = function isub (num) {
	    // this - (-num) = this + num
	    if (num.negative !== 0) {
	      num.negative = 0;
	      var r = this.iadd(num);
	      num.negative = 1;
	      return r._normSign();

	    // -this - num = -(this + num)
	    } else if (this.negative !== 0) {
	      this.negative = 0;
	      this.iadd(num);
	      this.negative = 1;
	      return this._normSign();
	    }

	    // At this point both numbers are positive
	    var cmp = this.cmp(num);

	    // Optimization - zeroify
	    if (cmp === 0) {
	      this.negative = 0;
	      this.length = 1;
	      this.words[0] = 0;
	      return this;
	    }

	    // a > b
	    var a, b;
	    if (cmp > 0) {
	      a = this;
	      b = num;
	    } else {
	      a = num;
	      b = this;
	    }

	    var carry = 0;
	    for (var i = 0; i < b.length; i++) {
	      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }
	    for (; carry !== 0 && i < a.length; i++) {
	      r = (a.words[i] | 0) + carry;
	      carry = r >> 26;
	      this.words[i] = r & 0x3ffffff;
	    }

	    // Copy rest of the words
	    if (carry === 0 && i < a.length && a !== this) {
	      for (; i < a.length; i++) {
	        this.words[i] = a.words[i];
	      }
	    }

	    this.length = Math.max(this.length, i);

	    if (a !== this) {
	      this.negative = 1;
	    }

	    return this._strip();
	  };

	  // Subtract `num` from `this`
	  BN.prototype.sub = function sub (num) {
	    return this.clone().isub(num);
	  };

	  function smallMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    var len = (self.length + num.length) | 0;
	    out.length = len;
	    len = (len - 1) | 0;

	    // Peel one iteration (compiler can't do it, because of code complexity)
	    var a = self.words[0] | 0;
	    var b = num.words[0] | 0;
	    var r = a * b;

	    var lo = r & 0x3ffffff;
	    var carry = (r / 0x4000000) | 0;
	    out.words[0] = lo;

	    for (var k = 1; k < len; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = carry >>> 26;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = (k - j) | 0;
	        a = self.words[i] | 0;
	        b = num.words[j] | 0;
	        r = a * b + rword;
	        ncarry += (r / 0x4000000) | 0;
	        rword = r & 0x3ffffff;
	      }
	      out.words[k] = rword | 0;
	      carry = ncarry | 0;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry | 0;
	    } else {
	      out.length--;
	    }

	    return out._strip();
	  }

	  // TODO(indutny): it may be reasonable to omit it for users who don't need
	  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
	  // multiplication (like elliptic secp256k1).
	  var comb10MulTo = function comb10MulTo (self, num, out) {
	    var a = self.words;
	    var b = num.words;
	    var o = out.words;
	    var c = 0;
	    var lo;
	    var mid;
	    var hi;
	    var a0 = a[0] | 0;
	    var al0 = a0 & 0x1fff;
	    var ah0 = a0 >>> 13;
	    var a1 = a[1] | 0;
	    var al1 = a1 & 0x1fff;
	    var ah1 = a1 >>> 13;
	    var a2 = a[2] | 0;
	    var al2 = a2 & 0x1fff;
	    var ah2 = a2 >>> 13;
	    var a3 = a[3] | 0;
	    var al3 = a3 & 0x1fff;
	    var ah3 = a3 >>> 13;
	    var a4 = a[4] | 0;
	    var al4 = a4 & 0x1fff;
	    var ah4 = a4 >>> 13;
	    var a5 = a[5] | 0;
	    var al5 = a5 & 0x1fff;
	    var ah5 = a5 >>> 13;
	    var a6 = a[6] | 0;
	    var al6 = a6 & 0x1fff;
	    var ah6 = a6 >>> 13;
	    var a7 = a[7] | 0;
	    var al7 = a7 & 0x1fff;
	    var ah7 = a7 >>> 13;
	    var a8 = a[8] | 0;
	    var al8 = a8 & 0x1fff;
	    var ah8 = a8 >>> 13;
	    var a9 = a[9] | 0;
	    var al9 = a9 & 0x1fff;
	    var ah9 = a9 >>> 13;
	    var b0 = b[0] | 0;
	    var bl0 = b0 & 0x1fff;
	    var bh0 = b0 >>> 13;
	    var b1 = b[1] | 0;
	    var bl1 = b1 & 0x1fff;
	    var bh1 = b1 >>> 13;
	    var b2 = b[2] | 0;
	    var bl2 = b2 & 0x1fff;
	    var bh2 = b2 >>> 13;
	    var b3 = b[3] | 0;
	    var bl3 = b3 & 0x1fff;
	    var bh3 = b3 >>> 13;
	    var b4 = b[4] | 0;
	    var bl4 = b4 & 0x1fff;
	    var bh4 = b4 >>> 13;
	    var b5 = b[5] | 0;
	    var bl5 = b5 & 0x1fff;
	    var bh5 = b5 >>> 13;
	    var b6 = b[6] | 0;
	    var bl6 = b6 & 0x1fff;
	    var bh6 = b6 >>> 13;
	    var b7 = b[7] | 0;
	    var bl7 = b7 & 0x1fff;
	    var bh7 = b7 >>> 13;
	    var b8 = b[8] | 0;
	    var bl8 = b8 & 0x1fff;
	    var bh8 = b8 >>> 13;
	    var b9 = b[9] | 0;
	    var bl9 = b9 & 0x1fff;
	    var bh9 = b9 >>> 13;

	    out.negative = self.negative ^ num.negative;
	    out.length = 19;
	    /* k = 0 */
	    lo = Math.imul(al0, bl0);
	    mid = Math.imul(al0, bh0);
	    mid = (mid + Math.imul(ah0, bl0)) | 0;
	    hi = Math.imul(ah0, bh0);
	    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
	    w0 &= 0x3ffffff;
	    /* k = 1 */
	    lo = Math.imul(al1, bl0);
	    mid = Math.imul(al1, bh0);
	    mid = (mid + Math.imul(ah1, bl0)) | 0;
	    hi = Math.imul(ah1, bh0);
	    lo = (lo + Math.imul(al0, bl1)) | 0;
	    mid = (mid + Math.imul(al0, bh1)) | 0;
	    mid = (mid + Math.imul(ah0, bl1)) | 0;
	    hi = (hi + Math.imul(ah0, bh1)) | 0;
	    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
	    w1 &= 0x3ffffff;
	    /* k = 2 */
	    lo = Math.imul(al2, bl0);
	    mid = Math.imul(al2, bh0);
	    mid = (mid + Math.imul(ah2, bl0)) | 0;
	    hi = Math.imul(ah2, bh0);
	    lo = (lo + Math.imul(al1, bl1)) | 0;
	    mid = (mid + Math.imul(al1, bh1)) | 0;
	    mid = (mid + Math.imul(ah1, bl1)) | 0;
	    hi = (hi + Math.imul(ah1, bh1)) | 0;
	    lo = (lo + Math.imul(al0, bl2)) | 0;
	    mid = (mid + Math.imul(al0, bh2)) | 0;
	    mid = (mid + Math.imul(ah0, bl2)) | 0;
	    hi = (hi + Math.imul(ah0, bh2)) | 0;
	    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
	    w2 &= 0x3ffffff;
	    /* k = 3 */
	    lo = Math.imul(al3, bl0);
	    mid = Math.imul(al3, bh0);
	    mid = (mid + Math.imul(ah3, bl0)) | 0;
	    hi = Math.imul(ah3, bh0);
	    lo = (lo + Math.imul(al2, bl1)) | 0;
	    mid = (mid + Math.imul(al2, bh1)) | 0;
	    mid = (mid + Math.imul(ah2, bl1)) | 0;
	    hi = (hi + Math.imul(ah2, bh1)) | 0;
	    lo = (lo + Math.imul(al1, bl2)) | 0;
	    mid = (mid + Math.imul(al1, bh2)) | 0;
	    mid = (mid + Math.imul(ah1, bl2)) | 0;
	    hi = (hi + Math.imul(ah1, bh2)) | 0;
	    lo = (lo + Math.imul(al0, bl3)) | 0;
	    mid = (mid + Math.imul(al0, bh3)) | 0;
	    mid = (mid + Math.imul(ah0, bl3)) | 0;
	    hi = (hi + Math.imul(ah0, bh3)) | 0;
	    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
	    w3 &= 0x3ffffff;
	    /* k = 4 */
	    lo = Math.imul(al4, bl0);
	    mid = Math.imul(al4, bh0);
	    mid = (mid + Math.imul(ah4, bl0)) | 0;
	    hi = Math.imul(ah4, bh0);
	    lo = (lo + Math.imul(al3, bl1)) | 0;
	    mid = (mid + Math.imul(al3, bh1)) | 0;
	    mid = (mid + Math.imul(ah3, bl1)) | 0;
	    hi = (hi + Math.imul(ah3, bh1)) | 0;
	    lo = (lo + Math.imul(al2, bl2)) | 0;
	    mid = (mid + Math.imul(al2, bh2)) | 0;
	    mid = (mid + Math.imul(ah2, bl2)) | 0;
	    hi = (hi + Math.imul(ah2, bh2)) | 0;
	    lo = (lo + Math.imul(al1, bl3)) | 0;
	    mid = (mid + Math.imul(al1, bh3)) | 0;
	    mid = (mid + Math.imul(ah1, bl3)) | 0;
	    hi = (hi + Math.imul(ah1, bh3)) | 0;
	    lo = (lo + Math.imul(al0, bl4)) | 0;
	    mid = (mid + Math.imul(al0, bh4)) | 0;
	    mid = (mid + Math.imul(ah0, bl4)) | 0;
	    hi = (hi + Math.imul(ah0, bh4)) | 0;
	    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
	    w4 &= 0x3ffffff;
	    /* k = 5 */
	    lo = Math.imul(al5, bl0);
	    mid = Math.imul(al5, bh0);
	    mid = (mid + Math.imul(ah5, bl0)) | 0;
	    hi = Math.imul(ah5, bh0);
	    lo = (lo + Math.imul(al4, bl1)) | 0;
	    mid = (mid + Math.imul(al4, bh1)) | 0;
	    mid = (mid + Math.imul(ah4, bl1)) | 0;
	    hi = (hi + Math.imul(ah4, bh1)) | 0;
	    lo = (lo + Math.imul(al3, bl2)) | 0;
	    mid = (mid + Math.imul(al3, bh2)) | 0;
	    mid = (mid + Math.imul(ah3, bl2)) | 0;
	    hi = (hi + Math.imul(ah3, bh2)) | 0;
	    lo = (lo + Math.imul(al2, bl3)) | 0;
	    mid = (mid + Math.imul(al2, bh3)) | 0;
	    mid = (mid + Math.imul(ah2, bl3)) | 0;
	    hi = (hi + Math.imul(ah2, bh3)) | 0;
	    lo = (lo + Math.imul(al1, bl4)) | 0;
	    mid = (mid + Math.imul(al1, bh4)) | 0;
	    mid = (mid + Math.imul(ah1, bl4)) | 0;
	    hi = (hi + Math.imul(ah1, bh4)) | 0;
	    lo = (lo + Math.imul(al0, bl5)) | 0;
	    mid = (mid + Math.imul(al0, bh5)) | 0;
	    mid = (mid + Math.imul(ah0, bl5)) | 0;
	    hi = (hi + Math.imul(ah0, bh5)) | 0;
	    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
	    w5 &= 0x3ffffff;
	    /* k = 6 */
	    lo = Math.imul(al6, bl0);
	    mid = Math.imul(al6, bh0);
	    mid = (mid + Math.imul(ah6, bl0)) | 0;
	    hi = Math.imul(ah6, bh0);
	    lo = (lo + Math.imul(al5, bl1)) | 0;
	    mid = (mid + Math.imul(al5, bh1)) | 0;
	    mid = (mid + Math.imul(ah5, bl1)) | 0;
	    hi = (hi + Math.imul(ah5, bh1)) | 0;
	    lo = (lo + Math.imul(al4, bl2)) | 0;
	    mid = (mid + Math.imul(al4, bh2)) | 0;
	    mid = (mid + Math.imul(ah4, bl2)) | 0;
	    hi = (hi + Math.imul(ah4, bh2)) | 0;
	    lo = (lo + Math.imul(al3, bl3)) | 0;
	    mid = (mid + Math.imul(al3, bh3)) | 0;
	    mid = (mid + Math.imul(ah3, bl3)) | 0;
	    hi = (hi + Math.imul(ah3, bh3)) | 0;
	    lo = (lo + Math.imul(al2, bl4)) | 0;
	    mid = (mid + Math.imul(al2, bh4)) | 0;
	    mid = (mid + Math.imul(ah2, bl4)) | 0;
	    hi = (hi + Math.imul(ah2, bh4)) | 0;
	    lo = (lo + Math.imul(al1, bl5)) | 0;
	    mid = (mid + Math.imul(al1, bh5)) | 0;
	    mid = (mid + Math.imul(ah1, bl5)) | 0;
	    hi = (hi + Math.imul(ah1, bh5)) | 0;
	    lo = (lo + Math.imul(al0, bl6)) | 0;
	    mid = (mid + Math.imul(al0, bh6)) | 0;
	    mid = (mid + Math.imul(ah0, bl6)) | 0;
	    hi = (hi + Math.imul(ah0, bh6)) | 0;
	    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
	    w6 &= 0x3ffffff;
	    /* k = 7 */
	    lo = Math.imul(al7, bl0);
	    mid = Math.imul(al7, bh0);
	    mid = (mid + Math.imul(ah7, bl0)) | 0;
	    hi = Math.imul(ah7, bh0);
	    lo = (lo + Math.imul(al6, bl1)) | 0;
	    mid = (mid + Math.imul(al6, bh1)) | 0;
	    mid = (mid + Math.imul(ah6, bl1)) | 0;
	    hi = (hi + Math.imul(ah6, bh1)) | 0;
	    lo = (lo + Math.imul(al5, bl2)) | 0;
	    mid = (mid + Math.imul(al5, bh2)) | 0;
	    mid = (mid + Math.imul(ah5, bl2)) | 0;
	    hi = (hi + Math.imul(ah5, bh2)) | 0;
	    lo = (lo + Math.imul(al4, bl3)) | 0;
	    mid = (mid + Math.imul(al4, bh3)) | 0;
	    mid = (mid + Math.imul(ah4, bl3)) | 0;
	    hi = (hi + Math.imul(ah4, bh3)) | 0;
	    lo = (lo + Math.imul(al3, bl4)) | 0;
	    mid = (mid + Math.imul(al3, bh4)) | 0;
	    mid = (mid + Math.imul(ah3, bl4)) | 0;
	    hi = (hi + Math.imul(ah3, bh4)) | 0;
	    lo = (lo + Math.imul(al2, bl5)) | 0;
	    mid = (mid + Math.imul(al2, bh5)) | 0;
	    mid = (mid + Math.imul(ah2, bl5)) | 0;
	    hi = (hi + Math.imul(ah2, bh5)) | 0;
	    lo = (lo + Math.imul(al1, bl6)) | 0;
	    mid = (mid + Math.imul(al1, bh6)) | 0;
	    mid = (mid + Math.imul(ah1, bl6)) | 0;
	    hi = (hi + Math.imul(ah1, bh6)) | 0;
	    lo = (lo + Math.imul(al0, bl7)) | 0;
	    mid = (mid + Math.imul(al0, bh7)) | 0;
	    mid = (mid + Math.imul(ah0, bl7)) | 0;
	    hi = (hi + Math.imul(ah0, bh7)) | 0;
	    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
	    w7 &= 0x3ffffff;
	    /* k = 8 */
	    lo = Math.imul(al8, bl0);
	    mid = Math.imul(al8, bh0);
	    mid = (mid + Math.imul(ah8, bl0)) | 0;
	    hi = Math.imul(ah8, bh0);
	    lo = (lo + Math.imul(al7, bl1)) | 0;
	    mid = (mid + Math.imul(al7, bh1)) | 0;
	    mid = (mid + Math.imul(ah7, bl1)) | 0;
	    hi = (hi + Math.imul(ah7, bh1)) | 0;
	    lo = (lo + Math.imul(al6, bl2)) | 0;
	    mid = (mid + Math.imul(al6, bh2)) | 0;
	    mid = (mid + Math.imul(ah6, bl2)) | 0;
	    hi = (hi + Math.imul(ah6, bh2)) | 0;
	    lo = (lo + Math.imul(al5, bl3)) | 0;
	    mid = (mid + Math.imul(al5, bh3)) | 0;
	    mid = (mid + Math.imul(ah5, bl3)) | 0;
	    hi = (hi + Math.imul(ah5, bh3)) | 0;
	    lo = (lo + Math.imul(al4, bl4)) | 0;
	    mid = (mid + Math.imul(al4, bh4)) | 0;
	    mid = (mid + Math.imul(ah4, bl4)) | 0;
	    hi = (hi + Math.imul(ah4, bh4)) | 0;
	    lo = (lo + Math.imul(al3, bl5)) | 0;
	    mid = (mid + Math.imul(al3, bh5)) | 0;
	    mid = (mid + Math.imul(ah3, bl5)) | 0;
	    hi = (hi + Math.imul(ah3, bh5)) | 0;
	    lo = (lo + Math.imul(al2, bl6)) | 0;
	    mid = (mid + Math.imul(al2, bh6)) | 0;
	    mid = (mid + Math.imul(ah2, bl6)) | 0;
	    hi = (hi + Math.imul(ah2, bh6)) | 0;
	    lo = (lo + Math.imul(al1, bl7)) | 0;
	    mid = (mid + Math.imul(al1, bh7)) | 0;
	    mid = (mid + Math.imul(ah1, bl7)) | 0;
	    hi = (hi + Math.imul(ah1, bh7)) | 0;
	    lo = (lo + Math.imul(al0, bl8)) | 0;
	    mid = (mid + Math.imul(al0, bh8)) | 0;
	    mid = (mid + Math.imul(ah0, bl8)) | 0;
	    hi = (hi + Math.imul(ah0, bh8)) | 0;
	    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
	    w8 &= 0x3ffffff;
	    /* k = 9 */
	    lo = Math.imul(al9, bl0);
	    mid = Math.imul(al9, bh0);
	    mid = (mid + Math.imul(ah9, bl0)) | 0;
	    hi = Math.imul(ah9, bh0);
	    lo = (lo + Math.imul(al8, bl1)) | 0;
	    mid = (mid + Math.imul(al8, bh1)) | 0;
	    mid = (mid + Math.imul(ah8, bl1)) | 0;
	    hi = (hi + Math.imul(ah8, bh1)) | 0;
	    lo = (lo + Math.imul(al7, bl2)) | 0;
	    mid = (mid + Math.imul(al7, bh2)) | 0;
	    mid = (mid + Math.imul(ah7, bl2)) | 0;
	    hi = (hi + Math.imul(ah7, bh2)) | 0;
	    lo = (lo + Math.imul(al6, bl3)) | 0;
	    mid = (mid + Math.imul(al6, bh3)) | 0;
	    mid = (mid + Math.imul(ah6, bl3)) | 0;
	    hi = (hi + Math.imul(ah6, bh3)) | 0;
	    lo = (lo + Math.imul(al5, bl4)) | 0;
	    mid = (mid + Math.imul(al5, bh4)) | 0;
	    mid = (mid + Math.imul(ah5, bl4)) | 0;
	    hi = (hi + Math.imul(ah5, bh4)) | 0;
	    lo = (lo + Math.imul(al4, bl5)) | 0;
	    mid = (mid + Math.imul(al4, bh5)) | 0;
	    mid = (mid + Math.imul(ah4, bl5)) | 0;
	    hi = (hi + Math.imul(ah4, bh5)) | 0;
	    lo = (lo + Math.imul(al3, bl6)) | 0;
	    mid = (mid + Math.imul(al3, bh6)) | 0;
	    mid = (mid + Math.imul(ah3, bl6)) | 0;
	    hi = (hi + Math.imul(ah3, bh6)) | 0;
	    lo = (lo + Math.imul(al2, bl7)) | 0;
	    mid = (mid + Math.imul(al2, bh7)) | 0;
	    mid = (mid + Math.imul(ah2, bl7)) | 0;
	    hi = (hi + Math.imul(ah2, bh7)) | 0;
	    lo = (lo + Math.imul(al1, bl8)) | 0;
	    mid = (mid + Math.imul(al1, bh8)) | 0;
	    mid = (mid + Math.imul(ah1, bl8)) | 0;
	    hi = (hi + Math.imul(ah1, bh8)) | 0;
	    lo = (lo + Math.imul(al0, bl9)) | 0;
	    mid = (mid + Math.imul(al0, bh9)) | 0;
	    mid = (mid + Math.imul(ah0, bl9)) | 0;
	    hi = (hi + Math.imul(ah0, bh9)) | 0;
	    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
	    w9 &= 0x3ffffff;
	    /* k = 10 */
	    lo = Math.imul(al9, bl1);
	    mid = Math.imul(al9, bh1);
	    mid = (mid + Math.imul(ah9, bl1)) | 0;
	    hi = Math.imul(ah9, bh1);
	    lo = (lo + Math.imul(al8, bl2)) | 0;
	    mid = (mid + Math.imul(al8, bh2)) | 0;
	    mid = (mid + Math.imul(ah8, bl2)) | 0;
	    hi = (hi + Math.imul(ah8, bh2)) | 0;
	    lo = (lo + Math.imul(al7, bl3)) | 0;
	    mid = (mid + Math.imul(al7, bh3)) | 0;
	    mid = (mid + Math.imul(ah7, bl3)) | 0;
	    hi = (hi + Math.imul(ah7, bh3)) | 0;
	    lo = (lo + Math.imul(al6, bl4)) | 0;
	    mid = (mid + Math.imul(al6, bh4)) | 0;
	    mid = (mid + Math.imul(ah6, bl4)) | 0;
	    hi = (hi + Math.imul(ah6, bh4)) | 0;
	    lo = (lo + Math.imul(al5, bl5)) | 0;
	    mid = (mid + Math.imul(al5, bh5)) | 0;
	    mid = (mid + Math.imul(ah5, bl5)) | 0;
	    hi = (hi + Math.imul(ah5, bh5)) | 0;
	    lo = (lo + Math.imul(al4, bl6)) | 0;
	    mid = (mid + Math.imul(al4, bh6)) | 0;
	    mid = (mid + Math.imul(ah4, bl6)) | 0;
	    hi = (hi + Math.imul(ah4, bh6)) | 0;
	    lo = (lo + Math.imul(al3, bl7)) | 0;
	    mid = (mid + Math.imul(al3, bh7)) | 0;
	    mid = (mid + Math.imul(ah3, bl7)) | 0;
	    hi = (hi + Math.imul(ah3, bh7)) | 0;
	    lo = (lo + Math.imul(al2, bl8)) | 0;
	    mid = (mid + Math.imul(al2, bh8)) | 0;
	    mid = (mid + Math.imul(ah2, bl8)) | 0;
	    hi = (hi + Math.imul(ah2, bh8)) | 0;
	    lo = (lo + Math.imul(al1, bl9)) | 0;
	    mid = (mid + Math.imul(al1, bh9)) | 0;
	    mid = (mid + Math.imul(ah1, bl9)) | 0;
	    hi = (hi + Math.imul(ah1, bh9)) | 0;
	    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
	    w10 &= 0x3ffffff;
	    /* k = 11 */
	    lo = Math.imul(al9, bl2);
	    mid = Math.imul(al9, bh2);
	    mid = (mid + Math.imul(ah9, bl2)) | 0;
	    hi = Math.imul(ah9, bh2);
	    lo = (lo + Math.imul(al8, bl3)) | 0;
	    mid = (mid + Math.imul(al8, bh3)) | 0;
	    mid = (mid + Math.imul(ah8, bl3)) | 0;
	    hi = (hi + Math.imul(ah8, bh3)) | 0;
	    lo = (lo + Math.imul(al7, bl4)) | 0;
	    mid = (mid + Math.imul(al7, bh4)) | 0;
	    mid = (mid + Math.imul(ah7, bl4)) | 0;
	    hi = (hi + Math.imul(ah7, bh4)) | 0;
	    lo = (lo + Math.imul(al6, bl5)) | 0;
	    mid = (mid + Math.imul(al6, bh5)) | 0;
	    mid = (mid + Math.imul(ah6, bl5)) | 0;
	    hi = (hi + Math.imul(ah6, bh5)) | 0;
	    lo = (lo + Math.imul(al5, bl6)) | 0;
	    mid = (mid + Math.imul(al5, bh6)) | 0;
	    mid = (mid + Math.imul(ah5, bl6)) | 0;
	    hi = (hi + Math.imul(ah5, bh6)) | 0;
	    lo = (lo + Math.imul(al4, bl7)) | 0;
	    mid = (mid + Math.imul(al4, bh7)) | 0;
	    mid = (mid + Math.imul(ah4, bl7)) | 0;
	    hi = (hi + Math.imul(ah4, bh7)) | 0;
	    lo = (lo + Math.imul(al3, bl8)) | 0;
	    mid = (mid + Math.imul(al3, bh8)) | 0;
	    mid = (mid + Math.imul(ah3, bl8)) | 0;
	    hi = (hi + Math.imul(ah3, bh8)) | 0;
	    lo = (lo + Math.imul(al2, bl9)) | 0;
	    mid = (mid + Math.imul(al2, bh9)) | 0;
	    mid = (mid + Math.imul(ah2, bl9)) | 0;
	    hi = (hi + Math.imul(ah2, bh9)) | 0;
	    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
	    w11 &= 0x3ffffff;
	    /* k = 12 */
	    lo = Math.imul(al9, bl3);
	    mid = Math.imul(al9, bh3);
	    mid = (mid + Math.imul(ah9, bl3)) | 0;
	    hi = Math.imul(ah9, bh3);
	    lo = (lo + Math.imul(al8, bl4)) | 0;
	    mid = (mid + Math.imul(al8, bh4)) | 0;
	    mid = (mid + Math.imul(ah8, bl4)) | 0;
	    hi = (hi + Math.imul(ah8, bh4)) | 0;
	    lo = (lo + Math.imul(al7, bl5)) | 0;
	    mid = (mid + Math.imul(al7, bh5)) | 0;
	    mid = (mid + Math.imul(ah7, bl5)) | 0;
	    hi = (hi + Math.imul(ah7, bh5)) | 0;
	    lo = (lo + Math.imul(al6, bl6)) | 0;
	    mid = (mid + Math.imul(al6, bh6)) | 0;
	    mid = (mid + Math.imul(ah6, bl6)) | 0;
	    hi = (hi + Math.imul(ah6, bh6)) | 0;
	    lo = (lo + Math.imul(al5, bl7)) | 0;
	    mid = (mid + Math.imul(al5, bh7)) | 0;
	    mid = (mid + Math.imul(ah5, bl7)) | 0;
	    hi = (hi + Math.imul(ah5, bh7)) | 0;
	    lo = (lo + Math.imul(al4, bl8)) | 0;
	    mid = (mid + Math.imul(al4, bh8)) | 0;
	    mid = (mid + Math.imul(ah4, bl8)) | 0;
	    hi = (hi + Math.imul(ah4, bh8)) | 0;
	    lo = (lo + Math.imul(al3, bl9)) | 0;
	    mid = (mid + Math.imul(al3, bh9)) | 0;
	    mid = (mid + Math.imul(ah3, bl9)) | 0;
	    hi = (hi + Math.imul(ah3, bh9)) | 0;
	    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
	    w12 &= 0x3ffffff;
	    /* k = 13 */
	    lo = Math.imul(al9, bl4);
	    mid = Math.imul(al9, bh4);
	    mid = (mid + Math.imul(ah9, bl4)) | 0;
	    hi = Math.imul(ah9, bh4);
	    lo = (lo + Math.imul(al8, bl5)) | 0;
	    mid = (mid + Math.imul(al8, bh5)) | 0;
	    mid = (mid + Math.imul(ah8, bl5)) | 0;
	    hi = (hi + Math.imul(ah8, bh5)) | 0;
	    lo = (lo + Math.imul(al7, bl6)) | 0;
	    mid = (mid + Math.imul(al7, bh6)) | 0;
	    mid = (mid + Math.imul(ah7, bl6)) | 0;
	    hi = (hi + Math.imul(ah7, bh6)) | 0;
	    lo = (lo + Math.imul(al6, bl7)) | 0;
	    mid = (mid + Math.imul(al6, bh7)) | 0;
	    mid = (mid + Math.imul(ah6, bl7)) | 0;
	    hi = (hi + Math.imul(ah6, bh7)) | 0;
	    lo = (lo + Math.imul(al5, bl8)) | 0;
	    mid = (mid + Math.imul(al5, bh8)) | 0;
	    mid = (mid + Math.imul(ah5, bl8)) | 0;
	    hi = (hi + Math.imul(ah5, bh8)) | 0;
	    lo = (lo + Math.imul(al4, bl9)) | 0;
	    mid = (mid + Math.imul(al4, bh9)) | 0;
	    mid = (mid + Math.imul(ah4, bl9)) | 0;
	    hi = (hi + Math.imul(ah4, bh9)) | 0;
	    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
	    w13 &= 0x3ffffff;
	    /* k = 14 */
	    lo = Math.imul(al9, bl5);
	    mid = Math.imul(al9, bh5);
	    mid = (mid + Math.imul(ah9, bl5)) | 0;
	    hi = Math.imul(ah9, bh5);
	    lo = (lo + Math.imul(al8, bl6)) | 0;
	    mid = (mid + Math.imul(al8, bh6)) | 0;
	    mid = (mid + Math.imul(ah8, bl6)) | 0;
	    hi = (hi + Math.imul(ah8, bh6)) | 0;
	    lo = (lo + Math.imul(al7, bl7)) | 0;
	    mid = (mid + Math.imul(al7, bh7)) | 0;
	    mid = (mid + Math.imul(ah7, bl7)) | 0;
	    hi = (hi + Math.imul(ah7, bh7)) | 0;
	    lo = (lo + Math.imul(al6, bl8)) | 0;
	    mid = (mid + Math.imul(al6, bh8)) | 0;
	    mid = (mid + Math.imul(ah6, bl8)) | 0;
	    hi = (hi + Math.imul(ah6, bh8)) | 0;
	    lo = (lo + Math.imul(al5, bl9)) | 0;
	    mid = (mid + Math.imul(al5, bh9)) | 0;
	    mid = (mid + Math.imul(ah5, bl9)) | 0;
	    hi = (hi + Math.imul(ah5, bh9)) | 0;
	    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
	    w14 &= 0x3ffffff;
	    /* k = 15 */
	    lo = Math.imul(al9, bl6);
	    mid = Math.imul(al9, bh6);
	    mid = (mid + Math.imul(ah9, bl6)) | 0;
	    hi = Math.imul(ah9, bh6);
	    lo = (lo + Math.imul(al8, bl7)) | 0;
	    mid = (mid + Math.imul(al8, bh7)) | 0;
	    mid = (mid + Math.imul(ah8, bl7)) | 0;
	    hi = (hi + Math.imul(ah8, bh7)) | 0;
	    lo = (lo + Math.imul(al7, bl8)) | 0;
	    mid = (mid + Math.imul(al7, bh8)) | 0;
	    mid = (mid + Math.imul(ah7, bl8)) | 0;
	    hi = (hi + Math.imul(ah7, bh8)) | 0;
	    lo = (lo + Math.imul(al6, bl9)) | 0;
	    mid = (mid + Math.imul(al6, bh9)) | 0;
	    mid = (mid + Math.imul(ah6, bl9)) | 0;
	    hi = (hi + Math.imul(ah6, bh9)) | 0;
	    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
	    w15 &= 0x3ffffff;
	    /* k = 16 */
	    lo = Math.imul(al9, bl7);
	    mid = Math.imul(al9, bh7);
	    mid = (mid + Math.imul(ah9, bl7)) | 0;
	    hi = Math.imul(ah9, bh7);
	    lo = (lo + Math.imul(al8, bl8)) | 0;
	    mid = (mid + Math.imul(al8, bh8)) | 0;
	    mid = (mid + Math.imul(ah8, bl8)) | 0;
	    hi = (hi + Math.imul(ah8, bh8)) | 0;
	    lo = (lo + Math.imul(al7, bl9)) | 0;
	    mid = (mid + Math.imul(al7, bh9)) | 0;
	    mid = (mid + Math.imul(ah7, bl9)) | 0;
	    hi = (hi + Math.imul(ah7, bh9)) | 0;
	    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
	    w16 &= 0x3ffffff;
	    /* k = 17 */
	    lo = Math.imul(al9, bl8);
	    mid = Math.imul(al9, bh8);
	    mid = (mid + Math.imul(ah9, bl8)) | 0;
	    hi = Math.imul(ah9, bh8);
	    lo = (lo + Math.imul(al8, bl9)) | 0;
	    mid = (mid + Math.imul(al8, bh9)) | 0;
	    mid = (mid + Math.imul(ah8, bl9)) | 0;
	    hi = (hi + Math.imul(ah8, bh9)) | 0;
	    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
	    w17 &= 0x3ffffff;
	    /* k = 18 */
	    lo = Math.imul(al9, bl9);
	    mid = Math.imul(al9, bh9);
	    mid = (mid + Math.imul(ah9, bl9)) | 0;
	    hi = Math.imul(ah9, bh9);
	    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
	    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
	    w18 &= 0x3ffffff;
	    o[0] = w0;
	    o[1] = w1;
	    o[2] = w2;
	    o[3] = w3;
	    o[4] = w4;
	    o[5] = w5;
	    o[6] = w6;
	    o[7] = w7;
	    o[8] = w8;
	    o[9] = w9;
	    o[10] = w10;
	    o[11] = w11;
	    o[12] = w12;
	    o[13] = w13;
	    o[14] = w14;
	    o[15] = w15;
	    o[16] = w16;
	    o[17] = w17;
	    o[18] = w18;
	    if (c !== 0) {
	      o[19] = c;
	      out.length++;
	    }
	    return out;
	  };

	  // Polyfill comb
	  if (!Math.imul) {
	    comb10MulTo = smallMulTo;
	  }

	  function bigMulTo (self, num, out) {
	    out.negative = num.negative ^ self.negative;
	    out.length = self.length + num.length;

	    var carry = 0;
	    var hncarry = 0;
	    for (var k = 0; k < out.length - 1; k++) {
	      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
	      // note that ncarry could be >= 0x3ffffff
	      var ncarry = hncarry;
	      hncarry = 0;
	      var rword = carry & 0x3ffffff;
	      var maxJ = Math.min(k, num.length - 1);
	      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
	        var i = k - j;
	        var a = self.words[i] | 0;
	        var b = num.words[j] | 0;
	        var r = a * b;

	        var lo = r & 0x3ffffff;
	        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
	        lo = (lo + rword) | 0;
	        rword = lo & 0x3ffffff;
	        ncarry = (ncarry + (lo >>> 26)) | 0;

	        hncarry += ncarry >>> 26;
	        ncarry &= 0x3ffffff;
	      }
	      out.words[k] = rword;
	      carry = ncarry;
	      ncarry = hncarry;
	    }
	    if (carry !== 0) {
	      out.words[k] = carry;
	    } else {
	      out.length--;
	    }

	    return out._strip();
	  }

	  function jumboMulTo (self, num, out) {
	    // Temporary disable, see https://github.com/indutny/bn.js/issues/211
	    // var fftm = new FFTM();
	    // return fftm.mulp(self, num, out);
	    return bigMulTo(self, num, out);
	  }

	  BN.prototype.mulTo = function mulTo (num, out) {
	    var res;
	    var len = this.length + num.length;
	    if (this.length === 10 && num.length === 10) {
	      res = comb10MulTo(this, num, out);
	    } else if (len < 63) {
	      res = smallMulTo(this, num, out);
	    } else if (len < 1024) {
	      res = bigMulTo(this, num, out);
	    } else {
	      res = jumboMulTo(this, num, out);
	    }

	    return res;
	  };

	  // Multiply `this` by `num`
	  BN.prototype.mul = function mul (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return this.mulTo(num, out);
	  };

	  // Multiply employing FFT
	  BN.prototype.mulf = function mulf (num) {
	    var out = new BN(null);
	    out.words = new Array(this.length + num.length);
	    return jumboMulTo(this, num, out);
	  };

	  // In-place Multiplication
	  BN.prototype.imul = function imul (num) {
	    return this.clone().mulTo(num, this);
	  };

	  BN.prototype.imuln = function imuln (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(typeof num === 'number');
	    assert(num < 0x4000000);

	    // Carry
	    var carry = 0;
	    for (var i = 0; i < this.length; i++) {
	      var w = (this.words[i] | 0) * num;
	      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
	      carry >>= 26;
	      carry += (w / 0x4000000) | 0;
	      // NOTE: lo is 27bit maximum
	      carry += lo >>> 26;
	      this.words[i] = lo & 0x3ffffff;
	    }

	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }

	    return isNegNum ? this.ineg() : this;
	  };

	  BN.prototype.muln = function muln (num) {
	    return this.clone().imuln(num);
	  };

	  // `this` * `this`
	  BN.prototype.sqr = function sqr () {
	    return this.mul(this);
	  };

	  // `this` * `this` in-place
	  BN.prototype.isqr = function isqr () {
	    return this.imul(this.clone());
	  };

	  // Math.pow(`this`, `num`)
	  BN.prototype.pow = function pow (num) {
	    var w = toBitArray(num);
	    if (w.length === 0) return new BN(1);

	    // Skip leading zeroes
	    var res = this;
	    for (var i = 0; i < w.length; i++, res = res.sqr()) {
	      if (w[i] !== 0) break;
	    }

	    if (++i < w.length) {
	      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
	        if (w[i] === 0) continue;

	        res = res.mul(q);
	      }
	    }

	    return res;
	  };

	  // Shift-left in-place
	  BN.prototype.iushln = function iushln (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;
	    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
	    var i;

	    if (r !== 0) {
	      var carry = 0;

	      for (i = 0; i < this.length; i++) {
	        var newCarry = this.words[i] & carryMask;
	        var c = ((this.words[i] | 0) - newCarry) << r;
	        this.words[i] = c | carry;
	        carry = newCarry >>> (26 - r);
	      }

	      if (carry) {
	        this.words[i] = carry;
	        this.length++;
	      }
	    }

	    if (s !== 0) {
	      for (i = this.length - 1; i >= 0; i--) {
	        this.words[i + s] = this.words[i];
	      }

	      for (i = 0; i < s; i++) {
	        this.words[i] = 0;
	      }

	      this.length += s;
	    }

	    return this._strip();
	  };

	  BN.prototype.ishln = function ishln (bits) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushln(bits);
	  };

	  // Shift-right in-place
	  // NOTE: `hint` is a lowest bit before trailing zeroes
	  // NOTE: if `extended` is present - it will be filled with destroyed bits
	  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var h;
	    if (hint) {
	      h = (hint - (hint % 26)) / 26;
	    } else {
	      h = 0;
	    }

	    var r = bits % 26;
	    var s = Math.min((bits - r) / 26, this.length);
	    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	    var maskedWords = extended;

	    h -= s;
	    h = Math.max(0, h);

	    // Extended mode, copy masked part
	    if (maskedWords) {
	      for (var i = 0; i < s; i++) {
	        maskedWords.words[i] = this.words[i];
	      }
	      maskedWords.length = s;
	    }

	    if (s === 0) ; else if (this.length > s) {
	      this.length -= s;
	      for (i = 0; i < this.length; i++) {
	        this.words[i] = this.words[i + s];
	      }
	    } else {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    var carry = 0;
	    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
	      var word = this.words[i] | 0;
	      this.words[i] = (carry << (26 - r)) | (word >>> r);
	      carry = word & mask;
	    }

	    // Push carried bits as a mask
	    if (maskedWords && carry !== 0) {
	      maskedWords.words[maskedWords.length++] = carry;
	    }

	    if (this.length === 0) {
	      this.words[0] = 0;
	      this.length = 1;
	    }

	    return this._strip();
	  };

	  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
	    // TODO(indutny): implement me
	    assert(this.negative === 0);
	    return this.iushrn(bits, hint, extended);
	  };

	  // Shift-left
	  BN.prototype.shln = function shln (bits) {
	    return this.clone().ishln(bits);
	  };

	  BN.prototype.ushln = function ushln (bits) {
	    return this.clone().iushln(bits);
	  };

	  // Shift-right
	  BN.prototype.shrn = function shrn (bits) {
	    return this.clone().ishrn(bits);
	  };

	  BN.prototype.ushrn = function ushrn (bits) {
	    return this.clone().iushrn(bits);
	  };

	  // Test if n bit is set
	  BN.prototype.testn = function testn (bit) {
	    assert(typeof bit === 'number' && bit >= 0);
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) return false;

	    // Check bit and return
	    var w = this.words[s];

	    return !!(w & q);
	  };

	  // Return only lowers bits of number (in-place)
	  BN.prototype.imaskn = function imaskn (bits) {
	    assert(typeof bits === 'number' && bits >= 0);
	    var r = bits % 26;
	    var s = (bits - r) / 26;

	    assert(this.negative === 0, 'imaskn works only with positive numbers');

	    if (this.length <= s) {
	      return this;
	    }

	    if (r !== 0) {
	      s++;
	    }
	    this.length = Math.min(s, this.length);

	    if (r !== 0) {
	      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
	      this.words[this.length - 1] &= mask;
	    }

	    return this._strip();
	  };

	  // Return only lowers bits of number
	  BN.prototype.maskn = function maskn (bits) {
	    return this.clone().imaskn(bits);
	  };

	  // Add plain number `num` to `this`
	  BN.prototype.iaddn = function iaddn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.isubn(-num);

	    // Possible sign change
	    if (this.negative !== 0) {
	      if (this.length === 1 && (this.words[0] | 0) <= num) {
	        this.words[0] = num - (this.words[0] | 0);
	        this.negative = 0;
	        return this;
	      }

	      this.negative = 0;
	      this.isubn(num);
	      this.negative = 1;
	      return this;
	    }

	    // Add without checks
	    return this._iaddn(num);
	  };

	  BN.prototype._iaddn = function _iaddn (num) {
	    this.words[0] += num;

	    // Carry
	    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
	      this.words[i] -= 0x4000000;
	      if (i === this.length - 1) {
	        this.words[i + 1] = 1;
	      } else {
	        this.words[i + 1]++;
	      }
	    }
	    this.length = Math.max(this.length, i + 1);

	    return this;
	  };

	  // Subtract plain number `num` from `this`
	  BN.prototype.isubn = function isubn (num) {
	    assert(typeof num === 'number');
	    assert(num < 0x4000000);
	    if (num < 0) return this.iaddn(-num);

	    if (this.negative !== 0) {
	      this.negative = 0;
	      this.iaddn(num);
	      this.negative = 1;
	      return this;
	    }

	    this.words[0] -= num;

	    if (this.length === 1 && this.words[0] < 0) {
	      this.words[0] = -this.words[0];
	      this.negative = 1;
	    } else {
	      // Carry
	      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
	        this.words[i] += 0x4000000;
	        this.words[i + 1] -= 1;
	      }
	    }

	    return this._strip();
	  };

	  BN.prototype.addn = function addn (num) {
	    return this.clone().iaddn(num);
	  };

	  BN.prototype.subn = function subn (num) {
	    return this.clone().isubn(num);
	  };

	  BN.prototype.iabs = function iabs () {
	    this.negative = 0;

	    return this;
	  };

	  BN.prototype.abs = function abs () {
	    return this.clone().iabs();
	  };

	  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
	    var len = num.length + shift;
	    var i;

	    this._expand(len);

	    var w;
	    var carry = 0;
	    for (i = 0; i < num.length; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      var right = (num.words[i] | 0) * mul;
	      w -= right & 0x3ffffff;
	      carry = (w >> 26) - ((right / 0x4000000) | 0);
	      this.words[i + shift] = w & 0x3ffffff;
	    }
	    for (; i < this.length - shift; i++) {
	      w = (this.words[i + shift] | 0) + carry;
	      carry = w >> 26;
	      this.words[i + shift] = w & 0x3ffffff;
	    }

	    if (carry === 0) return this._strip();

	    // Subtraction overflow
	    assert(carry === -1);
	    carry = 0;
	    for (i = 0; i < this.length; i++) {
	      w = -(this.words[i] | 0) + carry;
	      carry = w >> 26;
	      this.words[i] = w & 0x3ffffff;
	    }
	    this.negative = 1;

	    return this._strip();
	  };

	  BN.prototype._wordDiv = function _wordDiv (num, mode) {
	    var shift = this.length - num.length;

	    var a = this.clone();
	    var b = num;

	    // Normalize
	    var bhi = b.words[b.length - 1] | 0;
	    var bhiBits = this._countBits(bhi);
	    shift = 26 - bhiBits;
	    if (shift !== 0) {
	      b = b.ushln(shift);
	      a.iushln(shift);
	      bhi = b.words[b.length - 1] | 0;
	    }

	    // Initialize quotient
	    var m = a.length - b.length;
	    var q;

	    if (mode !== 'mod') {
	      q = new BN(null);
	      q.length = m + 1;
	      q.words = new Array(q.length);
	      for (var i = 0; i < q.length; i++) {
	        q.words[i] = 0;
	      }
	    }

	    var diff = a.clone()._ishlnsubmul(b, 1, m);
	    if (diff.negative === 0) {
	      a = diff;
	      if (q) {
	        q.words[m] = 1;
	      }
	    }

	    for (var j = m - 1; j >= 0; j--) {
	      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
	        (a.words[b.length + j - 1] | 0);

	      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
	      // (0x7ffffff)
	      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

	      a._ishlnsubmul(b, qj, j);
	      while (a.negative !== 0) {
	        qj--;
	        a.negative = 0;
	        a._ishlnsubmul(b, 1, j);
	        if (!a.isZero()) {
	          a.negative ^= 1;
	        }
	      }
	      if (q) {
	        q.words[j] = qj;
	      }
	    }
	    if (q) {
	      q._strip();
	    }
	    a._strip();

	    // Denormalize
	    if (mode !== 'div' && shift !== 0) {
	      a.iushrn(shift);
	    }

	    return {
	      div: q || null,
	      mod: a
	    };
	  };

	  // NOTE: 1) `mode` can be set to `mod` to request mod only,
	  //       to `div` to request div only, or be absent to
	  //       request both div & mod
	  //       2) `positive` is true if unsigned mod is requested
	  BN.prototype.divmod = function divmod (num, mode, positive) {
	    assert(!num.isZero());

	    if (this.isZero()) {
	      return {
	        div: new BN(0),
	        mod: new BN(0)
	      };
	    }

	    var div, mod, res;
	    if (this.negative !== 0 && num.negative === 0) {
	      res = this.neg().divmod(num, mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.iadd(num);
	        }
	      }

	      return {
	        div: div,
	        mod: mod
	      };
	    }

	    if (this.negative === 0 && num.negative !== 0) {
	      res = this.divmod(num.neg(), mode);

	      if (mode !== 'mod') {
	        div = res.div.neg();
	      }

	      return {
	        div: div,
	        mod: res.mod
	      };
	    }

	    if ((this.negative & num.negative) !== 0) {
	      res = this.neg().divmod(num.neg(), mode);

	      if (mode !== 'div') {
	        mod = res.mod.neg();
	        if (positive && mod.negative !== 0) {
	          mod.isub(num);
	        }
	      }

	      return {
	        div: res.div,
	        mod: mod
	      };
	    }

	    // Both numbers are positive at this point

	    // Strip both numbers to approximate shift value
	    if (num.length > this.length || this.cmp(num) < 0) {
	      return {
	        div: new BN(0),
	        mod: this
	      };
	    }

	    // Very short reduction
	    if (num.length === 1) {
	      if (mode === 'div') {
	        return {
	          div: this.divn(num.words[0]),
	          mod: null
	        };
	      }

	      if (mode === 'mod') {
	        return {
	          div: null,
	          mod: new BN(this.modrn(num.words[0]))
	        };
	      }

	      return {
	        div: this.divn(num.words[0]),
	        mod: new BN(this.modrn(num.words[0]))
	      };
	    }

	    return this._wordDiv(num, mode);
	  };

	  // Find `this` / `num`
	  BN.prototype.div = function div (num) {
	    return this.divmod(num, 'div', false).div;
	  };

	  // Find `this` % `num`
	  BN.prototype.mod = function mod (num) {
	    return this.divmod(num, 'mod', false).mod;
	  };

	  BN.prototype.umod = function umod (num) {
	    return this.divmod(num, 'mod', true).mod;
	  };

	  // Find Round(`this` / `num`)
	  BN.prototype.divRound = function divRound (num) {
	    var dm = this.divmod(num);

	    // Fast case - exact division
	    if (dm.mod.isZero()) return dm.div;

	    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

	    var half = num.ushrn(1);
	    var r2 = num.andln(1);
	    var cmp = mod.cmp(half);

	    // Round down
	    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div;

	    // Round up
	    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
	  };

	  BN.prototype.modrn = function modrn (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(num <= 0x3ffffff);
	    var p = (1 << 26) % num;

	    var acc = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      acc = (p * acc + (this.words[i] | 0)) % num;
	    }

	    return isNegNum ? -acc : acc;
	  };

	  // WARNING: DEPRECATED
	  BN.prototype.modn = function modn (num) {
	    return this.modrn(num);
	  };

	  // In-place division by number
	  BN.prototype.idivn = function idivn (num) {
	    var isNegNum = num < 0;
	    if (isNegNum) num = -num;

	    assert(num <= 0x3ffffff);

	    var carry = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var w = (this.words[i] | 0) + carry * 0x4000000;
	      this.words[i] = (w / num) | 0;
	      carry = w % num;
	    }

	    this._strip();
	    return isNegNum ? this.ineg() : this;
	  };

	  BN.prototype.divn = function divn (num) {
	    return this.clone().idivn(num);
	  };

	  BN.prototype.egcd = function egcd (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var x = this;
	    var y = p.clone();

	    if (x.negative !== 0) {
	      x = x.umod(p);
	    } else {
	      x = x.clone();
	    }

	    // A * x + B * y = x
	    var A = new BN(1);
	    var B = new BN(0);

	    // C * x + D * y = y
	    var C = new BN(0);
	    var D = new BN(1);

	    var g = 0;

	    while (x.isEven() && y.isEven()) {
	      x.iushrn(1);
	      y.iushrn(1);
	      ++g;
	    }

	    var yp = y.clone();
	    var xp = x.clone();

	    while (!x.isZero()) {
	      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        x.iushrn(i);
	        while (i-- > 0) {
	          if (A.isOdd() || B.isOdd()) {
	            A.iadd(yp);
	            B.isub(xp);
	          }

	          A.iushrn(1);
	          B.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        y.iushrn(j);
	        while (j-- > 0) {
	          if (C.isOdd() || D.isOdd()) {
	            C.iadd(yp);
	            D.isub(xp);
	          }

	          C.iushrn(1);
	          D.iushrn(1);
	        }
	      }

	      if (x.cmp(y) >= 0) {
	        x.isub(y);
	        A.isub(C);
	        B.isub(D);
	      } else {
	        y.isub(x);
	        C.isub(A);
	        D.isub(B);
	      }
	    }

	    return {
	      a: C,
	      b: D,
	      gcd: y.iushln(g)
	    };
	  };

	  // This is reduced incarnation of the binary EEA
	  // above, designated to invert members of the
	  // _prime_ fields F(p) at a maximal speed
	  BN.prototype._invmp = function _invmp (p) {
	    assert(p.negative === 0);
	    assert(!p.isZero());

	    var a = this;
	    var b = p.clone();

	    if (a.negative !== 0) {
	      a = a.umod(p);
	    } else {
	      a = a.clone();
	    }

	    var x1 = new BN(1);
	    var x2 = new BN(0);

	    var delta = b.clone();

	    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
	      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
	      if (i > 0) {
	        a.iushrn(i);
	        while (i-- > 0) {
	          if (x1.isOdd()) {
	            x1.iadd(delta);
	          }

	          x1.iushrn(1);
	        }
	      }

	      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
	      if (j > 0) {
	        b.iushrn(j);
	        while (j-- > 0) {
	          if (x2.isOdd()) {
	            x2.iadd(delta);
	          }

	          x2.iushrn(1);
	        }
	      }

	      if (a.cmp(b) >= 0) {
	        a.isub(b);
	        x1.isub(x2);
	      } else {
	        b.isub(a);
	        x2.isub(x1);
	      }
	    }

	    var res;
	    if (a.cmpn(1) === 0) {
	      res = x1;
	    } else {
	      res = x2;
	    }

	    if (res.cmpn(0) < 0) {
	      res.iadd(p);
	    }

	    return res;
	  };

	  BN.prototype.gcd = function gcd (num) {
	    if (this.isZero()) return num.abs();
	    if (num.isZero()) return this.abs();

	    var a = this.clone();
	    var b = num.clone();
	    a.negative = 0;
	    b.negative = 0;

	    // Remove common factor of two
	    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
	      a.iushrn(1);
	      b.iushrn(1);
	    }

	    do {
	      while (a.isEven()) {
	        a.iushrn(1);
	      }
	      while (b.isEven()) {
	        b.iushrn(1);
	      }

	      var r = a.cmp(b);
	      if (r < 0) {
	        // Swap `a` and `b` to make `a` always bigger than `b`
	        var t = a;
	        a = b;
	        b = t;
	      } else if (r === 0 || b.cmpn(1) === 0) {
	        break;
	      }

	      a.isub(b);
	    } while (true);

	    return b.iushln(shift);
	  };

	  // Invert number in the field F(num)
	  BN.prototype.invm = function invm (num) {
	    return this.egcd(num).a.umod(num);
	  };

	  BN.prototype.isEven = function isEven () {
	    return (this.words[0] & 1) === 0;
	  };

	  BN.prototype.isOdd = function isOdd () {
	    return (this.words[0] & 1) === 1;
	  };

	  // And first word and num
	  BN.prototype.andln = function andln (num) {
	    return this.words[0] & num;
	  };

	  // Increment at the bit position in-line
	  BN.prototype.bincn = function bincn (bit) {
	    assert(typeof bit === 'number');
	    var r = bit % 26;
	    var s = (bit - r) / 26;
	    var q = 1 << r;

	    // Fast case: bit is much higher than all existing words
	    if (this.length <= s) {
	      this._expand(s + 1);
	      this.words[s] |= q;
	      return this;
	    }

	    // Add bit and propagate, if needed
	    var carry = q;
	    for (var i = s; carry !== 0 && i < this.length; i++) {
	      var w = this.words[i] | 0;
	      w += carry;
	      carry = w >>> 26;
	      w &= 0x3ffffff;
	      this.words[i] = w;
	    }
	    if (carry !== 0) {
	      this.words[i] = carry;
	      this.length++;
	    }
	    return this;
	  };

	  BN.prototype.isZero = function isZero () {
	    return this.length === 1 && this.words[0] === 0;
	  };

	  BN.prototype.cmpn = function cmpn (num) {
	    var negative = num < 0;

	    if (this.negative !== 0 && !negative) return -1;
	    if (this.negative === 0 && negative) return 1;

	    this._strip();

	    var res;
	    if (this.length > 1) {
	      res = 1;
	    } else {
	      if (negative) {
	        num = -num;
	      }

	      assert(num <= 0x3ffffff, 'Number is too big');

	      var w = this.words[0] | 0;
	      res = w === num ? 0 : w < num ? -1 : 1;
	    }
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Compare two numbers and return:
	  // 1 - if `this` > `num`
	  // 0 - if `this` == `num`
	  // -1 - if `this` < `num`
	  BN.prototype.cmp = function cmp (num) {
	    if (this.negative !== 0 && num.negative === 0) return -1;
	    if (this.negative === 0 && num.negative !== 0) return 1;

	    var res = this.ucmp(num);
	    if (this.negative !== 0) return -res | 0;
	    return res;
	  };

	  // Unsigned comparison
	  BN.prototype.ucmp = function ucmp (num) {
	    // At this point both numbers have the same sign
	    if (this.length > num.length) return 1;
	    if (this.length < num.length) return -1;

	    var res = 0;
	    for (var i = this.length - 1; i >= 0; i--) {
	      var a = this.words[i] | 0;
	      var b = num.words[i] | 0;

	      if (a === b) continue;
	      if (a < b) {
	        res = -1;
	      } else if (a > b) {
	        res = 1;
	      }
	      break;
	    }
	    return res;
	  };

	  BN.prototype.gtn = function gtn (num) {
	    return this.cmpn(num) === 1;
	  };

	  BN.prototype.gt = function gt (num) {
	    return this.cmp(num) === 1;
	  };

	  BN.prototype.gten = function gten (num) {
	    return this.cmpn(num) >= 0;
	  };

	  BN.prototype.gte = function gte (num) {
	    return this.cmp(num) >= 0;
	  };

	  BN.prototype.ltn = function ltn (num) {
	    return this.cmpn(num) === -1;
	  };

	  BN.prototype.lt = function lt (num) {
	    return this.cmp(num) === -1;
	  };

	  BN.prototype.lten = function lten (num) {
	    return this.cmpn(num) <= 0;
	  };

	  BN.prototype.lte = function lte (num) {
	    return this.cmp(num) <= 0;
	  };

	  BN.prototype.eqn = function eqn (num) {
	    return this.cmpn(num) === 0;
	  };

	  BN.prototype.eq = function eq (num) {
	    return this.cmp(num) === 0;
	  };

	  //
	  // A reduce context, could be using montgomery or something better, depending
	  // on the `m` itself.
	  //
	  BN.red = function red (num) {
	    return new Red(num);
	  };

	  BN.prototype.toRed = function toRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    assert(this.negative === 0, 'red works only with positives');
	    return ctx.convertTo(this)._forceRed(ctx);
	  };

	  BN.prototype.fromRed = function fromRed () {
	    assert(this.red, 'fromRed works only with numbers in reduction context');
	    return this.red.convertFrom(this);
	  };

	  BN.prototype._forceRed = function _forceRed (ctx) {
	    this.red = ctx;
	    return this;
	  };

	  BN.prototype.forceRed = function forceRed (ctx) {
	    assert(!this.red, 'Already a number in reduction context');
	    return this._forceRed(ctx);
	  };

	  BN.prototype.redAdd = function redAdd (num) {
	    assert(this.red, 'redAdd works only with red numbers');
	    return this.red.add(this, num);
	  };

	  BN.prototype.redIAdd = function redIAdd (num) {
	    assert(this.red, 'redIAdd works only with red numbers');
	    return this.red.iadd(this, num);
	  };

	  BN.prototype.redSub = function redSub (num) {
	    assert(this.red, 'redSub works only with red numbers');
	    return this.red.sub(this, num);
	  };

	  BN.prototype.redISub = function redISub (num) {
	    assert(this.red, 'redISub works only with red numbers');
	    return this.red.isub(this, num);
	  };

	  BN.prototype.redShl = function redShl (num) {
	    assert(this.red, 'redShl works only with red numbers');
	    return this.red.shl(this, num);
	  };

	  BN.prototype.redMul = function redMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.mul(this, num);
	  };

	  BN.prototype.redIMul = function redIMul (num) {
	    assert(this.red, 'redMul works only with red numbers');
	    this.red._verify2(this, num);
	    return this.red.imul(this, num);
	  };

	  BN.prototype.redSqr = function redSqr () {
	    assert(this.red, 'redSqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqr(this);
	  };

	  BN.prototype.redISqr = function redISqr () {
	    assert(this.red, 'redISqr works only with red numbers');
	    this.red._verify1(this);
	    return this.red.isqr(this);
	  };

	  // Square root over p
	  BN.prototype.redSqrt = function redSqrt () {
	    assert(this.red, 'redSqrt works only with red numbers');
	    this.red._verify1(this);
	    return this.red.sqrt(this);
	  };

	  BN.prototype.redInvm = function redInvm () {
	    assert(this.red, 'redInvm works only with red numbers');
	    this.red._verify1(this);
	    return this.red.invm(this);
	  };

	  // Return negative clone of `this` % `red modulo`
	  BN.prototype.redNeg = function redNeg () {
	    assert(this.red, 'redNeg works only with red numbers');
	    this.red._verify1(this);
	    return this.red.neg(this);
	  };

	  BN.prototype.redPow = function redPow (num) {
	    assert(this.red && !num.red, 'redPow(normalNum)');
	    this.red._verify1(this);
	    return this.red.pow(this, num);
	  };

	  // Prime numbers with efficient reduction
	  var primes = {
	    k256: null,
	    p224: null,
	    p192: null,
	    p25519: null
	  };

	  // Pseudo-Mersenne prime
	  function MPrime (name, p) {
	    // P = 2 ^ N - K
	    this.name = name;
	    this.p = new BN(p, 16);
	    this.n = this.p.bitLength();
	    this.k = new BN(1).iushln(this.n).isub(this.p);

	    this.tmp = this._tmp();
	  }

	  MPrime.prototype._tmp = function _tmp () {
	    var tmp = new BN(null);
	    tmp.words = new Array(Math.ceil(this.n / 13));
	    return tmp;
	  };

	  MPrime.prototype.ireduce = function ireduce (num) {
	    // Assumes that `num` is less than `P^2`
	    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
	    var r = num;
	    var rlen;

	    do {
	      this.split(r, this.tmp);
	      r = this.imulK(r);
	      r = r.iadd(this.tmp);
	      rlen = r.bitLength();
	    } while (rlen > this.n);

	    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
	    if (cmp === 0) {
	      r.words[0] = 0;
	      r.length = 1;
	    } else if (cmp > 0) {
	      r.isub(this.p);
	    } else {
	      if (r.strip !== undefined) {
	        // r is a BN v4 instance
	        r.strip();
	      } else {
	        // r is a BN v5 instance
	        r._strip();
	      }
	    }

	    return r;
	  };

	  MPrime.prototype.split = function split (input, out) {
	    input.iushrn(this.n, 0, out);
	  };

	  MPrime.prototype.imulK = function imulK (num) {
	    return num.imul(this.k);
	  };

	  function K256 () {
	    MPrime.call(
	      this,
	      'k256',
	      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
	  }
	  inherits(K256, MPrime);

	  K256.prototype.split = function split (input, output) {
	    // 256 = 9 * 26 + 22
	    var mask = 0x3fffff;

	    var outLen = Math.min(input.length, 9);
	    for (var i = 0; i < outLen; i++) {
	      output.words[i] = input.words[i];
	    }
	    output.length = outLen;

	    if (input.length <= 9) {
	      input.words[0] = 0;
	      input.length = 1;
	      return;
	    }

	    // Shift by 9 limbs
	    var prev = input.words[9];
	    output.words[output.length++] = prev & mask;

	    for (i = 10; i < input.length; i++) {
	      var next = input.words[i] | 0;
	      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
	      prev = next;
	    }
	    prev >>>= 22;
	    input.words[i - 10] = prev;
	    if (prev === 0 && input.length > 10) {
	      input.length -= 10;
	    } else {
	      input.length -= 9;
	    }
	  };

	  K256.prototype.imulK = function imulK (num) {
	    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
	    num.words[num.length] = 0;
	    num.words[num.length + 1] = 0;
	    num.length += 2;

	    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
	    var lo = 0;
	    for (var i = 0; i < num.length; i++) {
	      var w = num.words[i] | 0;
	      lo += w * 0x3d1;
	      num.words[i] = lo & 0x3ffffff;
	      lo = w * 0x40 + ((lo / 0x4000000) | 0);
	    }

	    // Fast length reduction
	    if (num.words[num.length - 1] === 0) {
	      num.length--;
	      if (num.words[num.length - 1] === 0) {
	        num.length--;
	      }
	    }
	    return num;
	  };

	  function P224 () {
	    MPrime.call(
	      this,
	      'p224',
	      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
	  }
	  inherits(P224, MPrime);

	  function P192 () {
	    MPrime.call(
	      this,
	      'p192',
	      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
	  }
	  inherits(P192, MPrime);

	  function P25519 () {
	    // 2 ^ 255 - 19
	    MPrime.call(
	      this,
	      '25519',
	      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
	  }
	  inherits(P25519, MPrime);

	  P25519.prototype.imulK = function imulK (num) {
	    // K = 0x13
	    var carry = 0;
	    for (var i = 0; i < num.length; i++) {
	      var hi = (num.words[i] | 0) * 0x13 + carry;
	      var lo = hi & 0x3ffffff;
	      hi >>>= 26;

	      num.words[i] = lo;
	      carry = hi;
	    }
	    if (carry !== 0) {
	      num.words[num.length++] = carry;
	    }
	    return num;
	  };

	  // Exported mostly for testing purposes, use plain name instead
	  BN._prime = function prime (name) {
	    // Cached version of prime
	    if (primes[name]) return primes[name];

	    var prime;
	    if (name === 'k256') {
	      prime = new K256();
	    } else if (name === 'p224') {
	      prime = new P224();
	    } else if (name === 'p192') {
	      prime = new P192();
	    } else if (name === 'p25519') {
	      prime = new P25519();
	    } else {
	      throw new Error('Unknown prime ' + name);
	    }
	    primes[name] = prime;

	    return prime;
	  };

	  //
	  // Base reduction engine
	  //
	  function Red (m) {
	    if (typeof m === 'string') {
	      var prime = BN._prime(m);
	      this.m = prime.p;
	      this.prime = prime;
	    } else {
	      assert(m.gtn(1), 'modulus must be greater than 1');
	      this.m = m;
	      this.prime = null;
	    }
	  }

	  Red.prototype._verify1 = function _verify1 (a) {
	    assert(a.negative === 0, 'red works only with positives');
	    assert(a.red, 'red works only with red numbers');
	  };

	  Red.prototype._verify2 = function _verify2 (a, b) {
	    assert((a.negative | b.negative) === 0, 'red works only with positives');
	    assert(a.red && a.red === b.red,
	      'red works only with red numbers');
	  };

	  Red.prototype.imod = function imod (a) {
	    if (this.prime) return this.prime.ireduce(a)._forceRed(this);

	    move(a, a.umod(this.m)._forceRed(this));
	    return a;
	  };

	  Red.prototype.neg = function neg (a) {
	    if (a.isZero()) {
	      return a.clone();
	    }

	    return this.m.sub(a)._forceRed(this);
	  };

	  Red.prototype.add = function add (a, b) {
	    this._verify2(a, b);

	    var res = a.add(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.iadd = function iadd (a, b) {
	    this._verify2(a, b);

	    var res = a.iadd(b);
	    if (res.cmp(this.m) >= 0) {
	      res.isub(this.m);
	    }
	    return res;
	  };

	  Red.prototype.sub = function sub (a, b) {
	    this._verify2(a, b);

	    var res = a.sub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res._forceRed(this);
	  };

	  Red.prototype.isub = function isub (a, b) {
	    this._verify2(a, b);

	    var res = a.isub(b);
	    if (res.cmpn(0) < 0) {
	      res.iadd(this.m);
	    }
	    return res;
	  };

	  Red.prototype.shl = function shl (a, num) {
	    this._verify1(a);
	    return this.imod(a.ushln(num));
	  };

	  Red.prototype.imul = function imul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.imul(b));
	  };

	  Red.prototype.mul = function mul (a, b) {
	    this._verify2(a, b);
	    return this.imod(a.mul(b));
	  };

	  Red.prototype.isqr = function isqr (a) {
	    return this.imul(a, a.clone());
	  };

	  Red.prototype.sqr = function sqr (a) {
	    return this.mul(a, a);
	  };

	  Red.prototype.sqrt = function sqrt (a) {
	    if (a.isZero()) return a.clone();

	    var mod3 = this.m.andln(3);
	    assert(mod3 % 2 === 1);

	    // Fast case
	    if (mod3 === 3) {
	      var pow = this.m.add(new BN(1)).iushrn(2);
	      return this.pow(a, pow);
	    }

	    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
	    //
	    // Find Q and S, that Q * 2 ^ S = (P - 1)
	    var q = this.m.subn(1);
	    var s = 0;
	    while (!q.isZero() && q.andln(1) === 0) {
	      s++;
	      q.iushrn(1);
	    }
	    assert(!q.isZero());

	    var one = new BN(1).toRed(this);
	    var nOne = one.redNeg();

	    // Find quadratic non-residue
	    // NOTE: Max is such because of generalized Riemann hypothesis.
	    var lpow = this.m.subn(1).iushrn(1);
	    var z = this.m.bitLength();
	    z = new BN(2 * z * z).toRed(this);

	    while (this.pow(z, lpow).cmp(nOne) !== 0) {
	      z.redIAdd(nOne);
	    }

	    var c = this.pow(z, q);
	    var r = this.pow(a, q.addn(1).iushrn(1));
	    var t = this.pow(a, q);
	    var m = s;
	    while (t.cmp(one) !== 0) {
	      var tmp = t;
	      for (var i = 0; tmp.cmp(one) !== 0; i++) {
	        tmp = tmp.redSqr();
	      }
	      assert(i < m);
	      var b = this.pow(c, new BN(1).iushln(m - i - 1));

	      r = r.redMul(b);
	      c = b.redSqr();
	      t = t.redMul(c);
	      m = i;
	    }

	    return r;
	  };

	  Red.prototype.invm = function invm (a) {
	    var inv = a._invmp(this.m);
	    if (inv.negative !== 0) {
	      inv.negative = 0;
	      return this.imod(inv).redNeg();
	    } else {
	      return this.imod(inv);
	    }
	  };

	  Red.prototype.pow = function pow (a, num) {
	    if (num.isZero()) return new BN(1).toRed(this);
	    if (num.cmpn(1) === 0) return a.clone();

	    var windowSize = 4;
	    var wnd = new Array(1 << windowSize);
	    wnd[0] = new BN(1).toRed(this);
	    wnd[1] = a;
	    for (var i = 2; i < wnd.length; i++) {
	      wnd[i] = this.mul(wnd[i - 1], a);
	    }

	    var res = wnd[0];
	    var current = 0;
	    var currentLen = 0;
	    var start = num.bitLength() % 26;
	    if (start === 0) {
	      start = 26;
	    }

	    for (i = num.length - 1; i >= 0; i--) {
	      var word = num.words[i];
	      for (var j = start - 1; j >= 0; j--) {
	        var bit = (word >> j) & 1;
	        if (res !== wnd[0]) {
	          res = this.sqr(res);
	        }

	        if (bit === 0 && current === 0) {
	          currentLen = 0;
	          continue;
	        }

	        current <<= 1;
	        current |= bit;
	        currentLen++;
	        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

	        res = this.mul(res, wnd[current]);
	        currentLen = 0;
	        current = 0;
	      }
	      start = 26;
	    }

	    return res;
	  };

	  Red.prototype.convertTo = function convertTo (num) {
	    var r = num.umod(this.m);

	    return r === num ? r.clone() : r;
	  };

	  Red.prototype.convertFrom = function convertFrom (num) {
	    var res = num.clone();
	    res.red = null;
	    return res;
	  };

	  //
	  // Montgomery method engine
	  //

	  BN.mont = function mont (num) {
	    return new Mont(num);
	  };

	  function Mont (m) {
	    Red.call(this, m);

	    this.shift = this.m.bitLength();
	    if (this.shift % 26 !== 0) {
	      this.shift += 26 - (this.shift % 26);
	    }

	    this.r = new BN(1).iushln(this.shift);
	    this.r2 = this.imod(this.r.sqr());
	    this.rinv = this.r._invmp(this.m);

	    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
	    this.minv = this.minv.umod(this.r);
	    this.minv = this.r.sub(this.minv);
	  }
	  inherits(Mont, Red);

	  Mont.prototype.convertTo = function convertTo (num) {
	    return this.imod(num.ushln(this.shift));
	  };

	  Mont.prototype.convertFrom = function convertFrom (num) {
	    var r = this.imod(num.mul(this.rinv));
	    r.red = null;
	    return r;
	  };

	  Mont.prototype.imul = function imul (a, b) {
	    if (a.isZero() || b.isZero()) {
	      a.words[0] = 0;
	      a.length = 1;
	      return a;
	    }

	    var t = a.imul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;

	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.mul = function mul (a, b) {
	    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

	    var t = a.mul(b);
	    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
	    var u = t.isub(c).iushrn(this.shift);
	    var res = u;
	    if (u.cmp(this.m) >= 0) {
	      res = u.isub(this.m);
	    } else if (u.cmpn(0) < 0) {
	      res = u.iadd(this.m);
	    }

	    return res._forceRed(this);
	  };

	  Mont.prototype.invm = function invm (a) {
	    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
	    var res = this.imod(a._invmp(this.m).mul(this.r2));
	    return res._forceRed(this);
	  };
	})(module, commonjsGlobal);
	}(bn));

	var BN = bn.exports;

	var safeBuffer = {exports: {}};

	var buffer = {};

	var base64Js = {};

	base64Js.byteLength = byteLength;
	base64Js.toByteArray = toByteArray;
	base64Js.fromByteArray = fromByteArray;

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i];
	  revLookup[code.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;

	function getLens (b64) {
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;

	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4);

	  return [validLen, placeHoldersLen]
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function toByteArray (b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];

	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen;

	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = (tmp >> 16) & 0xFF;
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    );
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    );
	  }

	  return parts.join('')
	}

	var ieee754 = {};

	/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

	ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	};

	ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = (nBytes * 8) - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = ((value * c) - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	};

	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <https://feross.org>
	 * @license  MIT
	 */

	(function (exports) {

	const base64 = base64Js;
	const ieee754$1 = ieee754;
	const customInspectSymbol =
	  (typeof Symbol === 'function' && typeof Symbol['for'] === 'function') // eslint-disable-line dot-notation
	    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
	    : null;

	exports.Buffer = Buffer;
	exports.SlowBuffer = SlowBuffer;
	exports.INSPECT_MAX_BYTES = 50;

	const K_MAX_LENGTH = 0x7fffffff;
	exports.kMaxLength = K_MAX_LENGTH;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
	 *               implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * We report that the browser does not support typed arrays if the are not subclassable
	 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
	 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
	 * for __proto__ and has a buggy typed array implementation.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

	if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
	    typeof console.error === 'function') {
	  console.error(
	    'This browser lacks typed array (Uint8Array) support which is required by ' +
	    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
	  );
	}

	function typedArraySupport () {
	  // Can typed array instances can be augmented?
	  try {
	    const arr = new Uint8Array(1);
	    const proto = { foo: function () { return 42 } };
	    Object.setPrototypeOf(proto, Uint8Array.prototype);
	    Object.setPrototypeOf(arr, proto);
	    return arr.foo() === 42
	  } catch (e) {
	    return false
	  }
	}

	Object.defineProperty(Buffer.prototype, 'parent', {
	  enumerable: true,
	  get: function () {
	    if (!Buffer.isBuffer(this)) return undefined
	    return this.buffer
	  }
	});

	Object.defineProperty(Buffer.prototype, 'offset', {
	  enumerable: true,
	  get: function () {
	    if (!Buffer.isBuffer(this)) return undefined
	    return this.byteOffset
	  }
	});

	function createBuffer (length) {
	  if (length > K_MAX_LENGTH) {
	    throw new RangeError('The value "' + length + '" is invalid for option "size"')
	  }
	  // Return an augmented `Uint8Array` instance
	  const buf = new Uint8Array(length);
	  Object.setPrototypeOf(buf, Buffer.prototype);
	  return buf
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new TypeError(
	        'The "string" argument must be of type string. Received type number'
	      )
	    }
	    return allocUnsafe(arg)
	  }
	  return from(arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192; // not used by this implementation

	function from (value, encodingOrOffset, length) {
	  if (typeof value === 'string') {
	    return fromString(value, encodingOrOffset)
	  }

	  if (ArrayBuffer.isView(value)) {
	    return fromArrayView(value)
	  }

	  if (value == null) {
	    throw new TypeError(
	      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
	      'or Array-like Object. Received type ' + (typeof value)
	    )
	  }

	  if (isInstance(value, ArrayBuffer) ||
	      (value && isInstance(value.buffer, ArrayBuffer))) {
	    return fromArrayBuffer(value, encodingOrOffset, length)
	  }

	  if (typeof SharedArrayBuffer !== 'undefined' &&
	      (isInstance(value, SharedArrayBuffer) ||
	      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
	    return fromArrayBuffer(value, encodingOrOffset, length)
	  }

	  if (typeof value === 'number') {
	    throw new TypeError(
	      'The "value" argument must not be of type number. Received type number'
	    )
	  }

	  const valueOf = value.valueOf && value.valueOf();
	  if (valueOf != null && valueOf !== value) {
	    return Buffer.from(valueOf, encodingOrOffset, length)
	  }

	  const b = fromObject(value);
	  if (b) return b

	  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
	      typeof value[Symbol.toPrimitive] === 'function') {
	    return Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
	  }

	  throw new TypeError(
	    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
	    'or Array-like Object. Received type ' + (typeof value)
	  )
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(value, encodingOrOffset, length)
	};

	// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
	// https://github.com/feross/buffer/pull/148
	Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
	Object.setPrototypeOf(Buffer, Uint8Array);

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be of type number')
	  } else if (size < 0) {
	    throw new RangeError('The value "' + size + '" is invalid for option "size"')
	  }
	}

	function alloc (size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpreted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(size).fill(fill, encoding)
	      : createBuffer(size).fill(fill)
	  }
	  return createBuffer(size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(size, fill, encoding)
	};

	function allocUnsafe (size) {
	  assertSize(size);
	  return createBuffer(size < 0 ? 0 : checked(size) | 0)
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(size)
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(size)
	};

	function fromString (string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('Unknown encoding: ' + encoding)
	  }

	  const length = byteLength(string, encoding) | 0;
	  let buf = createBuffer(length);

	  const actual = buf.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    buf = buf.slice(0, actual);
	  }

	  return buf
	}

	function fromArrayLike (array) {
	  const length = array.length < 0 ? 0 : checked(array.length) | 0;
	  const buf = createBuffer(length);
	  for (let i = 0; i < length; i += 1) {
	    buf[i] = array[i] & 255;
	  }
	  return buf
	}

	function fromArrayView (arrayView) {
	  if (isInstance(arrayView, Uint8Array)) {
	    const copy = new Uint8Array(arrayView);
	    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
	  }
	  return fromArrayLike(arrayView)
	}

	function fromArrayBuffer (array, byteOffset, length) {
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('"offset" is outside of buffer bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('"length" is outside of buffer bounds')
	  }

	  let buf;
	  if (byteOffset === undefined && length === undefined) {
	    buf = new Uint8Array(array);
	  } else if (length === undefined) {
	    buf = new Uint8Array(array, byteOffset);
	  } else {
	    buf = new Uint8Array(array, byteOffset, length);
	  }

	  // Return an augmented `Uint8Array` instance
	  Object.setPrototypeOf(buf, Buffer.prototype);

	  return buf
	}

	function fromObject (obj) {
	  if (Buffer.isBuffer(obj)) {
	    const len = checked(obj.length) | 0;
	    const buf = createBuffer(len);

	    if (buf.length === 0) {
	      return buf
	    }

	    obj.copy(buf, 0, 0, len);
	    return buf
	  }

	  if (obj.length !== undefined) {
	    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
	      return createBuffer(0)
	    }
	    return fromArrayLike(obj)
	  }

	  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
	    return fromArrayLike(obj.data)
	  }
	}

	function checked (length) {
	  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= K_MAX_LENGTH) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0;
	  }
	  return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return b != null && b._isBuffer === true &&
	    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
	};

	Buffer.compare = function compare (a, b) {
	  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
	  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError(
	      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
	    )
	  }

	  if (a === b) return 0

	  let x = a.length;
	  let y = b.length;

	  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	};

	Buffer.concat = function concat (list, length) {
	  if (!Array.isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  let i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  const buffer = Buffer.allocUnsafe(length);
	  let pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    let buf = list[i];
	    if (isInstance(buf, Uint8Array)) {
	      if (pos + buf.length > buffer.length) {
	        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
	        buf.copy(buffer, pos);
	      } else {
	        Uint8Array.prototype.set.call(
	          buffer,
	          buf,
	          pos
	        );
	      }
	    } else if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    } else {
	      buf.copy(buffer, pos);
	    }
	    pos += buf.length;
	  }
	  return buffer
	};

	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    throw new TypeError(
	      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
	      'Received type ' + typeof string
	    )
	  }

	  const len = string.length;
	  const mustMatch = (arguments.length > 2 && arguments[2] === true);
	  if (!mustMatch && len === 0) return 0

	  // Use a for loop to avoid recursion
	  let loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) {
	          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
	        }
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer.byteLength = byteLength;

	function slowToString (encoding, start, end) {
	  let loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
	// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
	// reliably in a browserify context because there could be multiple different
	// copies of the 'buffer' package in use. This method works even for Buffer
	// instances that were created from another copy of the `buffer` package.
	// See: https://github.com/feross/buffer/issues/154
	Buffer.prototype._isBuffer = true;

	function swap (b, n, m) {
	  const i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer.prototype.swap16 = function swap16 () {
	  const len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (let i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this
	};

	Buffer.prototype.swap32 = function swap32 () {
	  const len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (let i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this
	};

	Buffer.prototype.swap64 = function swap64 () {
	  const len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (let i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this
	};

	Buffer.prototype.toString = function toString () {
	  const length = this.length;
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	};

	Buffer.prototype.toLocaleString = Buffer.prototype.toString;

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	};

	Buffer.prototype.inspect = function inspect () {
	  let str = '';
	  const max = exports.INSPECT_MAX_BYTES;
	  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
	  if (this.length > max) str += ' ... ';
	  return '<Buffer ' + str + '>'
	};
	if (customInspectSymbol) {
	  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (isInstance(target, Uint8Array)) {
	    target = Buffer.from(target, target.offset, target.byteLength);
	  }
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError(
	      'The "target" argument must be one of type Buffer or Uint8Array. ' +
	      'Received type ' + (typeof target)
	    )
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0

	  let x = thisEnd - thisStart;
	  let y = end - start;
	  const len = Math.min(x, y);

	  const thisCopy = this.slice(thisStart, thisEnd);
	  const targetCopy = target.slice(start, end);

	  for (let i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000;
	  }
	  byteOffset = +byteOffset; // Coerce to Number.
	  if (numberIsNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1);
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF; // Search for a byte value [0-255]
	    if (typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  let indexSize = 1;
	  let arrLength = arr.length;
	  let valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  let i;
	  if (dir) {
	    let foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      let found = true;
	      for (let j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false;
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	};

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	};

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	};

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  const remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  const strLen = string.length;

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  let i;
	  for (i = 0; i < length; ++i) {
	    const parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (numberIsNaN(parsed)) return i
	    buf[offset + i] = parsed;
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset >>> 0;
	    if (isFinite(length)) {
	      length = length >>> 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  const remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8';

	  let loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return asciiWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	};

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end);
	  const res = [];

	  let i = start;
	  while (i < end) {
	    const firstByte = buf[i];
	    let codePoint = null;
	    let bytesPerSequence = (firstByte > 0xEF)
	      ? 4
	      : (firstByte > 0xDF)
	          ? 3
	          : (firstByte > 0xBF)
	              ? 2
	              : 1;

	    if (i + bytesPerSequence <= end) {
	      let secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	      codePoint = 0xDC00 | codePoint & 0x3FF;
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	const MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray (codePoints) {
	  const len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  let res = '';
	  let i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    );
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  let ret = '';
	  end = Math.min(buf.length, end);

	  for (let i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F);
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  let ret = '';
	  end = Math.min(buf.length, end);

	  for (let i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  const len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  let out = '';
	  for (let i = start; i < end; ++i) {
	    out += hexSliceLookupTable[buf[i]];
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  const bytes = buf.slice(start, end);
	  let res = '';
	  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
	  for (let i = 0; i < bytes.length - 1; i += 2) {
	    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256));
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  const len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;

	  const newBuf = this.subarray(start, end);
	  // Return an augmented `Uint8Array` instance
	  Object.setPrototypeOf(newBuf, Buffer.prototype);

	  return newBuf
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUintLE =
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let val = this[offset];
	  let mul = 1;
	  let i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUintBE =
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  let val = this[offset + --byteLength];
	  let mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUint8 =
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset]
	};

	Buffer.prototype.readUint16LE =
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return this[offset] | (this[offset + 1] << 8)
	};

	Buffer.prototype.readUint16BE =
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return (this[offset] << 8) | this[offset + 1]
	};

	Buffer.prototype.readUint32LE =
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	};

	Buffer.prototype.readUint32BE =
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	};

	Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE (offset) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const lo = first +
	    this[++offset] * 2 ** 8 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 24;

	  const hi = this[++offset] +
	    this[++offset] * 2 ** 8 +
	    this[++offset] * 2 ** 16 +
	    last * 2 ** 24;

	  return BigInt(lo) + (BigInt(hi) << BigInt(32))
	});

	Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE (offset) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const hi = first * 2 ** 24 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    this[++offset];

	  const lo = this[++offset] * 2 ** 24 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    last;

	  return (BigInt(hi) << BigInt(32)) + BigInt(lo)
	});

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let val = this[offset];
	  let mul = 1;
	  let i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let i = byteLength;
	  let mul = 1;
	  let val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	};

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  const val = this[offset] | (this[offset + 1] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  const val = this[offset + 1] | (this[offset] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	};

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	};

	Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE (offset) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const val = this[offset + 4] +
	    this[offset + 5] * 2 ** 8 +
	    this[offset + 6] * 2 ** 16 +
	    (last << 24); // Overflow

	  return (BigInt(val) << BigInt(32)) +
	    BigInt(first +
	    this[++offset] * 2 ** 8 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 24)
	});

	Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE (offset) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const val = (first << 24) + // Overflow
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    this[++offset];

	  return (BigInt(val) << BigInt(32)) +
	    BigInt(this[++offset] * 2 ** 24 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    last)
	});

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return ieee754$1.read(this, offset, true, 23, 4)
	};

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return ieee754$1.read(this, offset, false, 23, 4)
	};

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return ieee754$1.read(this, offset, true, 52, 8)
	};

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return ieee754$1.read(this, offset, false, 52, 8)
	};

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUintLE =
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) {
	    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  let mul = 1;
	  let i = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUintBE =
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) {
	    const maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  let i = byteLength - 1;
	  let mul = 1;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUint8 =
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer.prototype.writeUint16LE =
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  this[offset] = (value & 0xff);
	  this[offset + 1] = (value >>> 8);
	  return offset + 2
	};

	Buffer.prototype.writeUint16BE =
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  this[offset] = (value >>> 8);
	  this[offset + 1] = (value & 0xff);
	  return offset + 2
	};

	Buffer.prototype.writeUint32LE =
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  this[offset + 3] = (value >>> 24);
	  this[offset + 2] = (value >>> 16);
	  this[offset + 1] = (value >>> 8);
	  this[offset] = (value & 0xff);
	  return offset + 4
	};

	Buffer.prototype.writeUint32BE =
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  this[offset] = (value >>> 24);
	  this[offset + 1] = (value >>> 16);
	  this[offset + 2] = (value >>> 8);
	  this[offset + 3] = (value & 0xff);
	  return offset + 4
	};

	function wrtBigUInt64LE (buf, value, offset, min, max) {
	  checkIntBI(value, min, max, buf, offset, 7);

	  let lo = Number(value & BigInt(0xffffffff));
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  return offset
	}

	function wrtBigUInt64BE (buf, value, offset, min, max) {
	  checkIntBI(value, min, max, buf, offset, 7);

	  let lo = Number(value & BigInt(0xffffffff));
	  buf[offset + 7] = lo;
	  lo = lo >> 8;
	  buf[offset + 6] = lo;
	  lo = lo >> 8;
	  buf[offset + 5] = lo;
	  lo = lo >> 8;
	  buf[offset + 4] = lo;
	  let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
	  buf[offset + 3] = hi;
	  hi = hi >> 8;
	  buf[offset + 2] = hi;
	  hi = hi >> 8;
	  buf[offset + 1] = hi;
	  hi = hi >> 8;
	  buf[offset] = hi;
	  return offset + 8
	}

	Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE (value, offset = 0) {
	  return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
	});

	Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE (value, offset = 0) {
	  return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
	});

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    const limit = Math.pow(2, (8 * byteLength) - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  let i = 0;
	  let mul = 1;
	  let sub = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    const limit = Math.pow(2, (8 * byteLength) - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  let i = byteLength - 1;
	  let mul = 1;
	  let sub = 0;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  this[offset] = (value & 0xff);
	  this[offset + 1] = (value >>> 8);
	  return offset + 2
	};

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  this[offset] = (value >>> 8);
	  this[offset + 1] = (value & 0xff);
	  return offset + 2
	};

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  this[offset] = (value & 0xff);
	  this[offset + 1] = (value >>> 8);
	  this[offset + 2] = (value >>> 16);
	  this[offset + 3] = (value >>> 24);
	  return offset + 4
	};

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (value < 0) value = 0xffffffff + value + 1;
	  this[offset] = (value >>> 24);
	  this[offset + 1] = (value >>> 16);
	  this[offset + 2] = (value >>> 8);
	  this[offset + 3] = (value & 0xff);
	  return offset + 4
	};

	Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE (value, offset = 0) {
	  return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
	});

	Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE (value, offset = 0) {
	  return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
	});

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4);
	  }
	  ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	};

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8);
	  }
	  ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  const len = end - start;

	  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
	    // Use built-in when available, missing from IE11
	    this.copyWithin(targetStart, start, end);
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, end),
	      targetStart
	    );
	  }

	  return len
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	    if (val.length === 1) {
	      const code = val.charCodeAt(0);
	      if ((encoding === 'utf8' && code < 128) ||
	          encoding === 'latin1') {
	        // Fast path: If `val` fits into a single byte, use that numeric value.
	        val = code;
	      }
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  } else if (typeof val === 'boolean') {
	    val = Number(val);
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  let i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    const bytes = Buffer.isBuffer(val)
	      ? val
	      : Buffer.from(val, encoding);
	    const len = bytes.length;
	    if (len === 0) {
	      throw new TypeError('The value "' + val +
	        '" is invalid for argument "value"')
	    }
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this
	};

	// CUSTOM ERRORS
	// =============

	// Simplified versions from Node, changed for Buffer-only usage
	const errors = {};
	function E (sym, getMessage, Base) {
	  errors[sym] = class NodeError extends Base {
	    constructor () {
	      super();

	      Object.defineProperty(this, 'message', {
	        value: getMessage.apply(this, arguments),
	        writable: true,
	        configurable: true
	      });

	      // Add the error code to the name to include it in the stack trace.
	      this.name = `${this.name} [${sym}]`;
	      // Access the stack to generate the error message including the error code
	      // from the name.
	      this.stack; // eslint-disable-line no-unused-expressions
	      // Reset the name to the actual name.
	      delete this.name;
	    }

	    get code () {
	      return sym
	    }

	    set code (value) {
	      Object.defineProperty(this, 'code', {
	        configurable: true,
	        enumerable: true,
	        value,
	        writable: true
	      });
	    }

	    toString () {
	      return `${this.name} [${sym}]: ${this.message}`
	    }
	  };
	}

	E('ERR_BUFFER_OUT_OF_BOUNDS',
	  function (name) {
	    if (name) {
	      return `${name} is outside of buffer bounds`
	    }

	    return 'Attempt to access memory outside buffer bounds'
	  }, RangeError);
	E('ERR_INVALID_ARG_TYPE',
	  function (name, actual) {
	    return `The "${name}" argument must be of type number. Received type ${typeof actual}`
	  }, TypeError);
	E('ERR_OUT_OF_RANGE',
	  function (str, range, input) {
	    let msg = `The value of "${str}" is out of range.`;
	    let received = input;
	    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
	      received = addNumericalSeparator(String(input));
	    } else if (typeof input === 'bigint') {
	      received = String(input);
	      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
	        received = addNumericalSeparator(received);
	      }
	      received += 'n';
	    }
	    msg += ` It must be ${range}. Received ${received}`;
	    return msg
	  }, RangeError);

	function addNumericalSeparator (val) {
	  let res = '';
	  let i = val.length;
	  const start = val[0] === '-' ? 1 : 0;
	  for (; i >= start + 4; i -= 3) {
	    res = `_${val.slice(i - 3, i)}${res}`;
	  }
	  return `${val.slice(0, i)}${res}`
	}

	// CHECK FUNCTIONS
	// ===============

	function checkBounds (buf, offset, byteLength) {
	  validateNumber(offset, 'offset');
	  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
	    boundsError(offset, buf.length - (byteLength + 1));
	  }
	}

	function checkIntBI (value, min, max, buf, offset, byteLength) {
	  if (value > max || value < min) {
	    const n = typeof min === 'bigint' ? 'n' : '';
	    let range;
	    if (byteLength > 3) {
	      if (min === 0 || min === BigInt(0)) {
	        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
	      } else {
	        range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
	                `${(byteLength + 1) * 8 - 1}${n}`;
	      }
	    } else {
	      range = `>= ${min}${n} and <= ${max}${n}`;
	    }
	    throw new errors.ERR_OUT_OF_RANGE('value', range, value)
	  }
	  checkBounds(buf, offset, byteLength);
	}

	function validateNumber (value, name) {
	  if (typeof value !== 'number') {
	    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
	  }
	}

	function boundsError (value, length, type) {
	  if (Math.floor(value) !== value) {
	    validateNumber(value, type);
	    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
	  }

	  if (length < 0) {
	    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
	  }

	  throw new errors.ERR_OUT_OF_RANGE(type || 'offset',
	                                    `>= ${type ? 1 : 0} and <= ${length}`,
	                                    value)
	}

	// HELPER FUNCTIONS
	// ================

	const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

	function base64clean (str) {
	  // Node takes equal signs as end of the Base64 encoding
	  str = str.split('=')[0];
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = str.trim().replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity;
	  let codePoint;
	  const length = string.length;
	  let leadSurrogate = null;
	  const bytes = [];

	  for (let i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	        leadSurrogate = codePoint;
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  const byteArray = [];
	  for (let i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF);
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  let c, hi, lo;
	  const byteArray = [];
	  for (let i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  let i;
	  for (i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i];
	  }
	  return i
	}

	// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
	// the `instanceof` check but they should be treated as of that type.
	// See: https://github.com/feross/buffer/issues/166
	function isInstance (obj, type) {
	  return obj instanceof type ||
	    (obj != null && obj.constructor != null && obj.constructor.name != null &&
	      obj.constructor.name === type.name)
	}
	function numberIsNaN (obj) {
	  // For IE11 support
	  return obj !== obj // eslint-disable-line no-self-compare
	}

	// Create lookup table for `toString('hex')`
	// See: https://github.com/feross/buffer/issues/219
	const hexSliceLookupTable = (function () {
	  const alphabet = '0123456789abcdef';
	  const table = new Array(256);
	  for (let i = 0; i < 16; ++i) {
	    const i16 = i * 16;
	    for (let j = 0; j < 16; ++j) {
	      table[i16 + j] = alphabet[i] + alphabet[j];
	    }
	  }
	  return table
	})();

	// Return not function with Error if BigInt not supported
	function defineBigIntMethod (fn) {
	  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
	}

	function BufferBigIntNotDefined () {
	  throw new Error('BigInt not supported')
	}
	}(buffer));

	/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

	(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */
	var buffer$1 = buffer;
	var Buffer = buffer$1.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer$1;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer$1, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.prototype = Object.create(Buffer.prototype);

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer$1.SlowBuffer(size)
	};
	}(safeBuffer, safeBuffer.exports));

	// base-x encoding / decoding
	// Copyright (c) 2018 base-x contributors
	// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
	// Distributed under the MIT software license, see the accompanying
	// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
	// @ts-ignore
	var _Buffer = safeBuffer.exports.Buffer;
	function base (ALPHABET) {
	  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
	  var BASE_MAP = new Uint8Array(256);
	  for (var j = 0; j < BASE_MAP.length; j++) {
	    BASE_MAP[j] = 255;
	  }
	  for (var i = 0; i < ALPHABET.length; i++) {
	    var x = ALPHABET.charAt(i);
	    var xc = x.charCodeAt(0);
	    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
	    BASE_MAP[xc] = i;
	  }
	  var BASE = ALPHABET.length;
	  var LEADER = ALPHABET.charAt(0);
	  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
	  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
	  function encode (source) {
	    if (Array.isArray(source) || source instanceof Uint8Array) { source = _Buffer.from(source); }
	    if (!_Buffer.isBuffer(source)) { throw new TypeError('Expected Buffer') }
	    if (source.length === 0) { return '' }
	        // Skip & count leading zeroes.
	    var zeroes = 0;
	    var length = 0;
	    var pbegin = 0;
	    var pend = source.length;
	    while (pbegin !== pend && source[pbegin] === 0) {
	      pbegin++;
	      zeroes++;
	    }
	        // Allocate enough space in big-endian base58 representation.
	    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
	    var b58 = new Uint8Array(size);
	        // Process the bytes.
	    while (pbegin !== pend) {
	      var carry = source[pbegin];
	            // Apply "b58 = b58 * 256 + ch".
	      var i = 0;
	      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
	        carry += (256 * b58[it1]) >>> 0;
	        b58[it1] = (carry % BASE) >>> 0;
	        carry = (carry / BASE) >>> 0;
	      }
	      if (carry !== 0) { throw new Error('Non-zero carry') }
	      length = i;
	      pbegin++;
	    }
	        // Skip leading zeroes in base58 result.
	    var it2 = size - length;
	    while (it2 !== size && b58[it2] === 0) {
	      it2++;
	    }
	        // Translate the result into a string.
	    var str = LEADER.repeat(zeroes);
	    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
	    return str
	  }
	  function decodeUnsafe (source) {
	    if (typeof source !== 'string') { throw new TypeError('Expected String') }
	    if (source.length === 0) { return _Buffer.alloc(0) }
	    var psz = 0;
	        // Skip leading spaces.
	    if (source[psz] === ' ') { return }
	        // Skip and count leading '1's.
	    var zeroes = 0;
	    var length = 0;
	    while (source[psz] === LEADER) {
	      zeroes++;
	      psz++;
	    }
	        // Allocate enough space in big-endian base256 representation.
	    var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
	    var b256 = new Uint8Array(size);
	        // Process the characters.
	    while (source[psz]) {
	            // Decode character
	      var carry = BASE_MAP[source.charCodeAt(psz)];
	            // Invalid character
	      if (carry === 255) { return }
	      var i = 0;
	      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
	        carry += (BASE * b256[it3]) >>> 0;
	        b256[it3] = (carry % 256) >>> 0;
	        carry = (carry / 256) >>> 0;
	      }
	      if (carry !== 0) { throw new Error('Non-zero carry') }
	      length = i;
	      psz++;
	    }
	        // Skip trailing spaces.
	    if (source[psz] === ' ') { return }
	        // Skip leading zeroes in b256.
	    var it4 = size - length;
	    while (it4 !== size && b256[it4] === 0) {
	      it4++;
	    }
	    var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
	    vch.fill(0x00, 0, zeroes);
	    var j = zeroes;
	    while (it4 !== size) {
	      vch[j++] = b256[it4++];
	    }
	    return vch
	  }
	  function decode (string) {
	    var buffer = decodeUnsafe(string);
	    if (buffer) { return buffer }
	    throw new Error('Non-base' + BASE + ' character')
	  }
	  return {
	    encode: encode,
	    decodeUnsafe: decodeUnsafe,
	    decode: decode
	  }
	}
	var src = base;

	var basex = src;
	var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

	var bs58 = basex(ALPHABET);

	// This is free and unencumbered software released into the public domain.
	// See LICENSE.md for more information.

	//
	// Utilities
	//

	/**
	 * @param {number} a The number to test.
	 * @param {number} min The minimum value in the range, inclusive.
	 * @param {number} max The maximum value in the range, inclusive.
	 * @return {boolean} True if a >= min and a <= max.
	 */
	function inRange(a, min, max) {
	  return min <= a && a <= max;
	}

	/**
	 * @param {*} o
	 * @return {Object}
	 */
	function ToDictionary(o) {
	  if (o === undefined) return {};
	  if (o === Object(o)) return o;
	  throw TypeError('Could not convert argument to dictionary');
	}

	/**
	 * @param {string} string Input string of UTF-16 code units.
	 * @return {!Array.<number>} Code points.
	 */
	function stringToCodePoints(string) {
	  // https://heycam.github.io/webidl/#dfn-obtain-unicode

	  // 1. Let S be the DOMString value.
	  var s = String(string);

	  // 2. Let n be the length of S.
	  var n = s.length;

	  // 3. Initialize i to 0.
	  var i = 0;

	  // 4. Initialize U to be an empty sequence of Unicode characters.
	  var u = [];

	  // 5. While i < n:
	  while (i < n) {

	    // 1. Let c be the code unit in S at index i.
	    var c = s.charCodeAt(i);

	    // 2. Depending on the value of c:

	    // c < 0xD800 or c > 0xDFFF
	    if (c < 0xD800 || c > 0xDFFF) {
	      // Append to U the Unicode character with code point c.
	      u.push(c);
	    }

	    // 0xDC00 ≤ c ≤ 0xDFFF
	    else if (0xDC00 <= c && c <= 0xDFFF) {
	      // Append to U a U+FFFD REPLACEMENT CHARACTER.
	      u.push(0xFFFD);
	    }

	    // 0xD800 ≤ c ≤ 0xDBFF
	    else if (0xD800 <= c && c <= 0xDBFF) {
	      // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
	      // CHARACTER.
	      if (i === n - 1) {
	        u.push(0xFFFD);
	      }
	      // 2. Otherwise, i < n−1:
	      else {
	        // 1. Let d be the code unit in S at index i+1.
	        var d = string.charCodeAt(i + 1);

	        // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
	        if (0xDC00 <= d && d <= 0xDFFF) {
	          // 1. Let a be c & 0x3FF.
	          var a = c & 0x3FF;

	          // 2. Let b be d & 0x3FF.
	          var b = d & 0x3FF;

	          // 3. Append to U the Unicode character with code point
	          // 2^16+2^10*a+b.
	          u.push(0x10000 + (a << 10) + b);

	          // 4. Set i to i+1.
	          i += 1;
	        }

	        // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
	        // U+FFFD REPLACEMENT CHARACTER.
	        else  {
	          u.push(0xFFFD);
	        }
	      }
	    }

	    // 3. Set i to i+1.
	    i += 1;
	  }

	  // 6. Return U.
	  return u;
	}

	/**
	 * @param {!Array.<number>} code_points Array of code points.
	 * @return {string} string String of UTF-16 code units.
	 */
	function codePointsToString(code_points) {
	  var s = '';
	  for (var i = 0; i < code_points.length; ++i) {
	    var cp = code_points[i];
	    if (cp <= 0xFFFF) {
	      s += String.fromCharCode(cp);
	    } else {
	      cp -= 0x10000;
	      s += String.fromCharCode((cp >> 10) + 0xD800,
	                               (cp & 0x3FF) + 0xDC00);
	    }
	  }
	  return s;
	}


	//
	// Implementation of Encoding specification
	// https://encoding.spec.whatwg.org/
	//

	//
	// 3. Terminology
	//

	/**
	 * End-of-stream is a special token that signifies no more tokens
	 * are in the stream.
	 * @const
	 */ var end_of_stream = -1;

	/**
	 * A stream represents an ordered sequence of tokens.
	 *
	 * @constructor
	 * @param {!(Array.<number>|Uint8Array)} tokens Array of tokens that provide the
	 * stream.
	 */
	function Stream(tokens) {
	  /** @type {!Array.<number>} */
	  this.tokens = [].slice.call(tokens);
	}

	Stream.prototype = {
	  /**
	   * @return {boolean} True if end-of-stream has been hit.
	   */
	  endOfStream: function() {
	    return !this.tokens.length;
	  },

	  /**
	   * When a token is read from a stream, the first token in the
	   * stream must be returned and subsequently removed, and
	   * end-of-stream must be returned otherwise.
	   *
	   * @return {number} Get the next token from the stream, or
	   * end_of_stream.
	   */
	   read: function() {
	    if (!this.tokens.length)
	      return end_of_stream;
	     return this.tokens.shift();
	   },

	  /**
	   * When one or more tokens are prepended to a stream, those tokens
	   * must be inserted, in given order, before the first token in the
	   * stream.
	   *
	   * @param {(number|!Array.<number>)} token The token(s) to prepend to the stream.
	   */
	  prepend: function(token) {
	    if (Array.isArray(token)) {
	      var tokens = /**@type {!Array.<number>}*/(token);
	      while (tokens.length)
	        this.tokens.unshift(tokens.pop());
	    } else {
	      this.tokens.unshift(token);
	    }
	  },

	  /**
	   * When one or more tokens are pushed to a stream, those tokens
	   * must be inserted, in given order, after the last token in the
	   * stream.
	   *
	   * @param {(number|!Array.<number>)} token The tokens(s) to prepend to the stream.
	   */
	  push: function(token) {
	    if (Array.isArray(token)) {
	      var tokens = /**@type {!Array.<number>}*/(token);
	      while (tokens.length)
	        this.tokens.push(tokens.shift());
	    } else {
	      this.tokens.push(token);
	    }
	  }
	};

	//
	// 4. Encodings
	//

	// 4.1 Encoders and decoders

	/** @const */
	var finished = -1;

	/**
	 * @param {boolean} fatal If true, decoding errors raise an exception.
	 * @param {number=} opt_code_point Override the standard fallback code point.
	 * @return {number} The code point to insert on a decoding error.
	 */
	function decoderError(fatal, opt_code_point) {
	  if (fatal)
	    throw TypeError('Decoder error');
	  return opt_code_point || 0xFFFD;
	}

	//
	// 7. API
	//

	/** @const */ var DEFAULT_ENCODING = 'utf-8';

	// 7.1 Interface TextDecoder

	/**
	 * @constructor
	 * @param {string=} encoding The label of the encoding;
	 *     defaults to 'utf-8'.
	 * @param {Object=} options
	 */
	function TextDecoder$1(encoding, options) {
	  if (!(this instanceof TextDecoder$1)) {
	    return new TextDecoder$1(encoding, options);
	  }
	  encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
	  if (encoding !== DEFAULT_ENCODING) {
	    throw new Error('Encoding not supported. Only utf-8 is supported');
	  }
	  options = ToDictionary(options);

	  /** @private @type {boolean} */
	  this._streaming = false;
	  /** @private @type {boolean} */
	  this._BOMseen = false;
	  /** @private @type {?Decoder} */
	  this._decoder = null;
	  /** @private @type {boolean} */
	  this._fatal = Boolean(options['fatal']);
	  /** @private @type {boolean} */
	  this._ignoreBOM = Boolean(options['ignoreBOM']);

	  Object.defineProperty(this, 'encoding', {value: 'utf-8'});
	  Object.defineProperty(this, 'fatal', {value: this._fatal});
	  Object.defineProperty(this, 'ignoreBOM', {value: this._ignoreBOM});
	}

	TextDecoder$1.prototype = {
	  /**
	   * @param {ArrayBufferView=} input The buffer of bytes to decode.
	   * @param {Object=} options
	   * @return {string} The decoded string.
	   */
	  decode: function decode(input, options) {
	    var bytes;
	    if (typeof input === 'object' && input instanceof ArrayBuffer) {
	      bytes = new Uint8Array(input);
	    } else if (typeof input === 'object' && 'buffer' in input &&
	               input.buffer instanceof ArrayBuffer) {
	      bytes = new Uint8Array(input.buffer,
	                             input.byteOffset,
	                             input.byteLength);
	    } else {
	      bytes = new Uint8Array(0);
	    }

	    options = ToDictionary(options);

	    if (!this._streaming) {
	      this._decoder = new UTF8Decoder({fatal: this._fatal});
	      this._BOMseen = false;
	    }
	    this._streaming = Boolean(options['stream']);

	    var input_stream = new Stream(bytes);

	    var code_points = [];

	    /** @type {?(number|!Array.<number>)} */
	    var result;

	    while (!input_stream.endOfStream()) {
	      result = this._decoder.handler(input_stream, input_stream.read());
	      if (result === finished)
	        break;
	      if (result === null)
	        continue;
	      if (Array.isArray(result))
	        code_points.push.apply(code_points, /**@type {!Array.<number>}*/(result));
	      else
	        code_points.push(result);
	    }
	    if (!this._streaming) {
	      do {
	        result = this._decoder.handler(input_stream, input_stream.read());
	        if (result === finished)
	          break;
	        if (result === null)
	          continue;
	        if (Array.isArray(result))
	          code_points.push.apply(code_points, /**@type {!Array.<number>}*/(result));
	        else
	          code_points.push(result);
	      } while (!input_stream.endOfStream());
	      this._decoder = null;
	    }

	    if (code_points.length) {
	      // If encoding is one of utf-8, utf-16be, and utf-16le, and
	      // ignore BOM flag and BOM seen flag are unset, run these
	      // subsubsteps:
	      if (['utf-8'].indexOf(this.encoding) !== -1 &&
	          !this._ignoreBOM && !this._BOMseen) {
	        // If token is U+FEFF, set BOM seen flag.
	        if (code_points[0] === 0xFEFF) {
	          this._BOMseen = true;
	          code_points.shift();
	        } else {
	          // Otherwise, if token is not end-of-stream, set BOM seen
	          // flag and append token to output.
	          this._BOMseen = true;
	        }
	      }
	    }

	    return codePointsToString(code_points);
	  }
	};

	// 7.2 Interface TextEncoder

	/**
	 * @constructor
	 * @param {string=} encoding The label of the encoding;
	 *     defaults to 'utf-8'.
	 * @param {Object=} options
	 */
	function TextEncoder(encoding, options) {
	  if (!(this instanceof TextEncoder))
	    return new TextEncoder(encoding, options);
	  encoding = encoding !== undefined ? String(encoding).toLowerCase() : DEFAULT_ENCODING;
	  if (encoding !== DEFAULT_ENCODING) {
	    throw new Error('Encoding not supported. Only utf-8 is supported');
	  }
	  options = ToDictionary(options);

	  /** @private @type {boolean} */
	  this._streaming = false;
	  /** @private @type {?Encoder} */
	  this._encoder = null;
	  /** @private @type {{fatal: boolean}} */
	  this._options = {fatal: Boolean(options['fatal'])};

	  Object.defineProperty(this, 'encoding', {value: 'utf-8'});
	}

	TextEncoder.prototype = {
	  /**
	   * @param {string=} opt_string The string to encode.
	   * @param {Object=} options
	   * @return {Uint8Array} Encoded bytes, as a Uint8Array.
	   */
	  encode: function encode(opt_string, options) {
	    opt_string = opt_string ? String(opt_string) : '';
	    options = ToDictionary(options);

	    // NOTE: This option is nonstandard. None of the encodings
	    // permitted for encoding (i.e. UTF-8, UTF-16) are stateful,
	    // so streaming is not necessary.
	    if (!this._streaming)
	      this._encoder = new UTF8Encoder(this._options);
	    this._streaming = Boolean(options['stream']);

	    var bytes = [];
	    var input_stream = new Stream(stringToCodePoints(opt_string));
	    /** @type {?(number|!Array.<number>)} */
	    var result;
	    while (!input_stream.endOfStream()) {
	      result = this._encoder.handler(input_stream, input_stream.read());
	      if (result === finished)
	        break;
	      if (Array.isArray(result))
	        bytes.push.apply(bytes, /**@type {!Array.<number>}*/(result));
	      else
	        bytes.push(result);
	    }
	    if (!this._streaming) {
	      while (true) {
	        result = this._encoder.handler(input_stream, input_stream.read());
	        if (result === finished)
	          break;
	        if (Array.isArray(result))
	          bytes.push.apply(bytes, /**@type {!Array.<number>}*/(result));
	        else
	          bytes.push(result);
	      }
	      this._encoder = null;
	    }
	    return new Uint8Array(bytes);
	  }
	};

	//
	// 8. The encoding
	//

	// 8.1 utf-8

	/**
	 * @constructor
	 * @implements {Decoder}
	 * @param {{fatal: boolean}} options
	 */
	function UTF8Decoder(options) {
	  var fatal = options.fatal;

	  // utf-8's decoder's has an associated utf-8 code point, utf-8
	  // bytes seen, and utf-8 bytes needed (all initially 0), a utf-8
	  // lower boundary (initially 0x80), and a utf-8 upper boundary
	  // (initially 0xBF).
	  var /** @type {number} */ utf8_code_point = 0,
	      /** @type {number} */ utf8_bytes_seen = 0,
	      /** @type {number} */ utf8_bytes_needed = 0,
	      /** @type {number} */ utf8_lower_boundary = 0x80,
	      /** @type {number} */ utf8_upper_boundary = 0xBF;

	  /**
	   * @param {Stream} stream The stream of bytes being decoded.
	   * @param {number} bite The next byte read from the stream.
	   * @return {?(number|!Array.<number>)} The next code point(s)
	   *     decoded, or null if not enough data exists in the input
	   *     stream to decode a complete code point.
	   */
	  this.handler = function(stream, bite) {
	    // 1. If byte is end-of-stream and utf-8 bytes needed is not 0,
	    // set utf-8 bytes needed to 0 and return error.
	    if (bite === end_of_stream && utf8_bytes_needed !== 0) {
	      utf8_bytes_needed = 0;
	      return decoderError(fatal);
	    }

	    // 2. If byte is end-of-stream, return finished.
	    if (bite === end_of_stream)
	      return finished;

	    // 3. If utf-8 bytes needed is 0, based on byte:
	    if (utf8_bytes_needed === 0) {

	      // 0x00 to 0x7F
	      if (inRange(bite, 0x00, 0x7F)) {
	        // Return a code point whose value is byte.
	        return bite;
	      }

	      // 0xC2 to 0xDF
	      if (inRange(bite, 0xC2, 0xDF)) {
	        // Set utf-8 bytes needed to 1 and utf-8 code point to byte
	        // − 0xC0.
	        utf8_bytes_needed = 1;
	        utf8_code_point = bite - 0xC0;
	      }

	      // 0xE0 to 0xEF
	      else if (inRange(bite, 0xE0, 0xEF)) {
	        // 1. If byte is 0xE0, set utf-8 lower boundary to 0xA0.
	        if (bite === 0xE0)
	          utf8_lower_boundary = 0xA0;
	        // 2. If byte is 0xED, set utf-8 upper boundary to 0x9F.
	        if (bite === 0xED)
	          utf8_upper_boundary = 0x9F;
	        // 3. Set utf-8 bytes needed to 2 and utf-8 code point to
	        // byte − 0xE0.
	        utf8_bytes_needed = 2;
	        utf8_code_point = bite - 0xE0;
	      }

	      // 0xF0 to 0xF4
	      else if (inRange(bite, 0xF0, 0xF4)) {
	        // 1. If byte is 0xF0, set utf-8 lower boundary to 0x90.
	        if (bite === 0xF0)
	          utf8_lower_boundary = 0x90;
	        // 2. If byte is 0xF4, set utf-8 upper boundary to 0x8F.
	        if (bite === 0xF4)
	          utf8_upper_boundary = 0x8F;
	        // 3. Set utf-8 bytes needed to 3 and utf-8 code point to
	        // byte − 0xF0.
	        utf8_bytes_needed = 3;
	        utf8_code_point = bite - 0xF0;
	      }

	      // Otherwise
	      else {
	        // Return error.
	        return decoderError(fatal);
	      }

	      // Then (byte is in the range 0xC2 to 0xF4) set utf-8 code
	      // point to utf-8 code point << (6 × utf-8 bytes needed) and
	      // return continue.
	      utf8_code_point = utf8_code_point << (6 * utf8_bytes_needed);
	      return null;
	    }

	    // 4. If byte is not in the range utf-8 lower boundary to utf-8
	    // upper boundary, run these substeps:
	    if (!inRange(bite, utf8_lower_boundary, utf8_upper_boundary)) {

	      // 1. Set utf-8 code point, utf-8 bytes needed, and utf-8
	      // bytes seen to 0, set utf-8 lower boundary to 0x80, and set
	      // utf-8 upper boundary to 0xBF.
	      utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;
	      utf8_lower_boundary = 0x80;
	      utf8_upper_boundary = 0xBF;

	      // 2. Prepend byte to stream.
	      stream.prepend(bite);

	      // 3. Return error.
	      return decoderError(fatal);
	    }

	    // 5. Set utf-8 lower boundary to 0x80 and utf-8 upper boundary
	    // to 0xBF.
	    utf8_lower_boundary = 0x80;
	    utf8_upper_boundary = 0xBF;

	    // 6. Increase utf-8 bytes seen by one and set utf-8 code point
	    // to utf-8 code point + (byte − 0x80) << (6 × (utf-8 bytes
	    // needed − utf-8 bytes seen)).
	    utf8_bytes_seen += 1;
	    utf8_code_point += (bite - 0x80) << (6 * (utf8_bytes_needed - utf8_bytes_seen));

	    // 7. If utf-8 bytes seen is not equal to utf-8 bytes needed,
	    // continue.
	    if (utf8_bytes_seen !== utf8_bytes_needed)
	      return null;

	    // 8. Let code point be utf-8 code point.
	    var code_point = utf8_code_point;

	    // 9. Set utf-8 code point, utf-8 bytes needed, and utf-8 bytes
	    // seen to 0.
	    utf8_code_point = utf8_bytes_needed = utf8_bytes_seen = 0;

	    // 10. Return a code point whose value is code point.
	    return code_point;
	  };
	}

	/**
	 * @constructor
	 * @implements {Encoder}
	 * @param {{fatal: boolean}} options
	 */
	function UTF8Encoder(options) {
	  options.fatal;
	  /**
	   * @param {Stream} stream Input stream.
	   * @param {number} code_point Next code point read from the stream.
	   * @return {(number|!Array.<number>)} Byte(s) to emit.
	   */
	  this.handler = function(stream, code_point) {
	    // 1. If code point is end-of-stream, return finished.
	    if (code_point === end_of_stream)
	      return finished;

	    // 2. If code point is in the range U+0000 to U+007F, return a
	    // byte whose value is code point.
	    if (inRange(code_point, 0x0000, 0x007f))
	      return code_point;

	    // 3. Set count and offset based on the range code point is in:
	    var count, offset;
	    // U+0080 to U+07FF:    1 and 0xC0
	    if (inRange(code_point, 0x0080, 0x07FF)) {
	      count = 1;
	      offset = 0xC0;
	    }
	    // U+0800 to U+FFFF:    2 and 0xE0
	    else if (inRange(code_point, 0x0800, 0xFFFF)) {
	      count = 2;
	      offset = 0xE0;
	    }
	    // U+10000 to U+10FFFF: 3 and 0xF0
	    else if (inRange(code_point, 0x10000, 0x10FFFF)) {
	      count = 3;
	      offset = 0xF0;
	    }

	    // 4.Let bytes be a byte sequence whose first byte is (code
	    // point >> (6 × count)) + offset.
	    var bytes = [(code_point >> (6 * count)) + offset];

	    // 5. Run these substeps while count is greater than 0:
	    while (count > 0) {

	      // 1. Set temp to code point >> (6 × (count − 1)).
	      var temp = code_point >> (6 * (count - 1));

	      // 2. Append to bytes 0x80 | (temp & 0x3F).
	      bytes.push(0x80 | (temp & 0x3F));

	      // 3. Decrease count by one.
	      count -= 1;
	    }

	    // 6. Return bytes bytes, in order.
	    return bytes;
	  };
	}

	var encoding_lib = /*#__PURE__*/Object.freeze({
		__proto__: null,
		TextEncoder: TextEncoder,
		TextDecoder: TextDecoder$1
	});

	var require$$2 = /*@__PURE__*/getAugmentedNamespace(encoding_lib);

	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __decorate = (commonjsGlobal && commonjsGlobal.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(lib, "__esModule", { value: true });
	var deserializeUnchecked_1 = lib.deserializeUnchecked = lib.deserialize = serialize_1 = lib.serialize = BinaryReader_1 = lib.BinaryReader = BinaryWriter_1 = lib.BinaryWriter = lib.BorshError = lib.baseDecode = lib.baseEncode = void 0;
	const bn_js_1 = __importDefault(bn.exports);
	const bs58_1 = __importDefault(bs58);
	// TODO: Make sure this polyfill not included when not required
	const encoding = __importStar(require$$2);
	const TextDecoder = (typeof commonjsGlobal.TextDecoder !== 'function') ? encoding.TextDecoder : commonjsGlobal.TextDecoder;
	const textDecoder = new TextDecoder('utf-8', { fatal: true });
	function baseEncode(value) {
	    if (typeof (value) === 'string') {
	        value = Buffer.from(value, 'utf8');
	    }
	    return bs58_1.default.encode(Buffer.from(value));
	}
	lib.baseEncode = baseEncode;
	function baseDecode(value) {
	    return Buffer.from(bs58_1.default.decode(value));
	}
	lib.baseDecode = baseDecode;
	const INITIAL_LENGTH = 1024;
	class BorshError extends Error {
	    constructor(message) {
	        super(message);
	        this.fieldPath = [];
	        this.originalMessage = message;
	    }
	    addToFieldPath(fieldName) {
	        this.fieldPath.splice(0, 0, fieldName);
	        // NOTE: Modifying message directly as jest doesn't use .toString()
	        this.message = this.originalMessage + ': ' + this.fieldPath.join('.');
	    }
	}
	lib.BorshError = BorshError;
	/// Binary encoder.
	class BinaryWriter {
	    constructor() {
	        this.buf = Buffer.alloc(INITIAL_LENGTH);
	        this.length = 0;
	    }
	    maybeResize() {
	        if (this.buf.length < 16 + this.length) {
	            this.buf = Buffer.concat([this.buf, Buffer.alloc(INITIAL_LENGTH)]);
	        }
	    }
	    writeU8(value) {
	        this.maybeResize();
	        this.buf.writeUInt8(value, this.length);
	        this.length += 1;
	    }
	    writeU16(value) {
	        this.maybeResize();
	        this.buf.writeUInt16LE(value, this.length);
	        this.length += 2;
	    }
	    writeU32(value) {
	        this.maybeResize();
	        this.buf.writeUInt32LE(value, this.length);
	        this.length += 4;
	    }
	    writeU64(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray('le', 8)));
	    }
	    writeU128(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray('le', 16)));
	    }
	    writeU256(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray('le', 32)));
	    }
	    writeU512(value) {
	        this.maybeResize();
	        this.writeBuffer(Buffer.from(new bn_js_1.default(value).toArray('le', 64)));
	    }
	    writeBuffer(buffer) {
	        // Buffer.from is needed as this.buf.subarray can return plain Uint8Array in browser
	        this.buf = Buffer.concat([Buffer.from(this.buf.subarray(0, this.length)), buffer, Buffer.alloc(INITIAL_LENGTH)]);
	        this.length += buffer.length;
	    }
	    writeString(str) {
	        this.maybeResize();
	        const b = Buffer.from(str, 'utf8');
	        this.writeU32(b.length);
	        this.writeBuffer(b);
	    }
	    writeFixedArray(array) {
	        this.writeBuffer(Buffer.from(array));
	    }
	    writeArray(array, fn) {
	        this.maybeResize();
	        this.writeU32(array.length);
	        for (const elem of array) {
	            this.maybeResize();
	            fn(elem);
	        }
	    }
	    toArray() {
	        return this.buf.subarray(0, this.length);
	    }
	}
	var BinaryWriter_1 = lib.BinaryWriter = BinaryWriter;
	function handlingRangeError(target, propertyKey, propertyDescriptor) {
	    const originalMethod = propertyDescriptor.value;
	    propertyDescriptor.value = function (...args) {
	        try {
	            return originalMethod.apply(this, args);
	        }
	        catch (e) {
	            if (e instanceof RangeError) {
	                const code = e.code;
	                if (['ERR_BUFFER_OUT_OF_BOUNDS', 'ERR_OUT_OF_RANGE'].indexOf(code) >= 0) {
	                    throw new BorshError('Reached the end of buffer when deserializing');
	                }
	            }
	            throw e;
	        }
	    };
	}
	class BinaryReader {
	    constructor(buf) {
	        this.buf = buf;
	        this.offset = 0;
	    }
	    readU8() {
	        const value = this.buf.readUInt8(this.offset);
	        this.offset += 1;
	        return value;
	    }
	    readU16() {
	        const value = this.buf.readUInt16LE(this.offset);
	        this.offset += 2;
	        return value;
	    }
	    readU32() {
	        const value = this.buf.readUInt32LE(this.offset);
	        this.offset += 4;
	        return value;
	    }
	    readU64() {
	        const buf = this.readBuffer(8);
	        return new bn_js_1.default(buf, 'le');
	    }
	    readU128() {
	        const buf = this.readBuffer(16);
	        return new bn_js_1.default(buf, 'le');
	    }
	    readU256() {
	        const buf = this.readBuffer(32);
	        return new bn_js_1.default(buf, 'le');
	    }
	    readU512() {
	        const buf = this.readBuffer(64);
	        return new bn_js_1.default(buf, 'le');
	    }
	    readBuffer(len) {
	        if ((this.offset + len) > this.buf.length) {
	            throw new BorshError(`Expected buffer length ${len} isn't within bounds`);
	        }
	        const result = this.buf.slice(this.offset, this.offset + len);
	        this.offset += len;
	        return result;
	    }
	    readString() {
	        const len = this.readU32();
	        const buf = this.readBuffer(len);
	        try {
	            // NOTE: Using TextDecoder to fail on invalid UTF-8
	            return textDecoder.decode(buf);
	        }
	        catch (e) {
	            throw new BorshError(`Error decoding UTF-8 string: ${e}`);
	        }
	    }
	    readFixedArray(len) {
	        return new Uint8Array(this.readBuffer(len));
	    }
	    readArray(fn) {
	        const len = this.readU32();
	        const result = Array();
	        for (let i = 0; i < len; ++i) {
	            result.push(fn());
	        }
	        return result;
	    }
	}
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU8", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU16", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU32", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU64", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU128", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU256", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readU512", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readString", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readFixedArray", null);
	__decorate([
	    handlingRangeError
	], BinaryReader.prototype, "readArray", null);
	var BinaryReader_1 = lib.BinaryReader = BinaryReader;
	function capitalizeFirstLetter(string) {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function serializeField(schema, fieldName, value, fieldType, writer) {
	    try {
	        // TODO: Handle missing values properly (make sure they never result in just skipped write)
	        if (typeof fieldType === 'string') {
	            writer[`write${capitalizeFirstLetter(fieldType)}`](value);
	        }
	        else if (fieldType instanceof Array) {
	            if (typeof fieldType[0] === 'number') {
	                if (value.length !== fieldType[0]) {
	                    throw new BorshError(`Expecting byte array of length ${fieldType[0]}, but got ${value.length} bytes`);
	                }
	                writer.writeFixedArray(value);
	            }
	            else {
	                writer.writeArray(value, (item) => { serializeField(schema, fieldName, item, fieldType[0], writer); });
	            }
	        }
	        else if (fieldType.kind !== undefined) {
	            switch (fieldType.kind) {
	                case 'option': {
	                    if (value === null || value === undefined) {
	                        writer.writeU8(0);
	                    }
	                    else {
	                        writer.writeU8(1);
	                        serializeField(schema, fieldName, value, fieldType.type, writer);
	                    }
	                    break;
	                }
	                default: throw new BorshError(`FieldType ${fieldType} unrecognized`);
	            }
	        }
	        else {
	            serializeStruct(schema, value, writer);
	        }
	    }
	    catch (error) {
	        if (error instanceof BorshError) {
	            error.addToFieldPath(fieldName);
	        }
	        throw error;
	    }
	}
	function serializeStruct(schema, obj, writer) {
	    const structSchema = schema.get(obj.constructor);
	    if (!structSchema) {
	        throw new BorshError(`Class ${obj.constructor.name} is missing in schema`);
	    }
	    if (structSchema.kind === 'struct') {
	        structSchema.fields.map(([fieldName, fieldType]) => {
	            serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
	        });
	    }
	    else if (structSchema.kind === 'enum') {
	        const name = obj[structSchema.field];
	        for (let idx = 0; idx < structSchema.values.length; ++idx) {
	            const [fieldName, fieldType] = structSchema.values[idx];
	            if (fieldName === name) {
	                writer.writeU8(idx);
	                serializeField(schema, fieldName, obj[fieldName], fieldType, writer);
	                break;
	            }
	        }
	    }
	    else {
	        throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${obj.constructor.name}`);
	    }
	}
	/// Serialize given object using schema of the form:
	/// { class_name -> [ [field_name, field_type], .. ], .. }
	function serialize(schema, obj) {
	    const writer = new BinaryWriter();
	    serializeStruct(schema, obj, writer);
	    return writer.toArray();
	}
	var serialize_1 = lib.serialize = serialize;
	function deserializeField(schema, fieldName, fieldType, reader) {
	    try {
	        if (typeof fieldType === 'string') {
	            return reader[`read${capitalizeFirstLetter(fieldType)}`]();
	        }
	        if (fieldType instanceof Array) {
	            if (typeof fieldType[0] === 'number') {
	                return reader.readFixedArray(fieldType[0]);
	            }
	            return reader.readArray(() => deserializeField(schema, fieldName, fieldType[0], reader));
	        }
	        if (fieldType.kind === 'option') {
	            const option = reader.readU8();
	            if (option) {
	                return deserializeField(schema, fieldName, fieldType.type, reader);
	            }
	            return undefined;
	        }
	        return deserializeStruct(schema, fieldType, reader);
	    }
	    catch (error) {
	        if (error instanceof BorshError) {
	            error.addToFieldPath(fieldName);
	        }
	        throw error;
	    }
	}
	function deserializeStruct(schema, classType, reader) {
	    const structSchema = schema.get(classType);
	    if (!structSchema) {
	        throw new BorshError(`Class ${classType.name} is missing in schema`);
	    }
	    if (structSchema.kind === 'struct') {
	        const result = {};
	        for (const [fieldName, fieldType] of schema.get(classType).fields) {
	            result[fieldName] = deserializeField(schema, fieldName, fieldType, reader);
	        }
	        return new classType(result);
	    }
	    if (structSchema.kind === 'enum') {
	        const idx = reader.readU8();
	        if (idx >= structSchema.values.length) {
	            throw new BorshError(`Enum index: ${idx} is out of range`);
	        }
	        const [fieldName, fieldType] = structSchema.values[idx];
	        const fieldValue = deserializeField(schema, fieldName, fieldType, reader);
	        return new classType({ [fieldName]: fieldValue });
	    }
	    throw new BorshError(`Unexpected schema kind: ${structSchema.kind} for ${classType.constructor.name}`);
	}
	/// Deserializes object from bytes using schema.
	function deserialize$1(schema, classType, buffer) {
	    const reader = new BinaryReader(buffer);
	    const result = deserializeStruct(schema, classType, reader);
	    if (reader.offset < buffer.length) {
	        throw new BorshError(`Unexpected ${buffer.length - reader.offset} bytes after deserialized data`);
	    }
	    return result;
	}
	lib.deserialize = deserialize$1;
	/// Deserializes object from bytes using schema, without checking the length read
	function deserializeUnchecked(schema, classType, buffer) {
	    const reader = new BinaryReader(buffer);
	    return deserializeStruct(schema, classType, reader);
	}
	deserializeUnchecked_1 = lib.deserializeUnchecked = deserializeUnchecked;

	const extendBorsh = () => {
	    BinaryReader_1.prototype.readPubkey = function () {
	        const reader = this;
	        const array = reader.readFixedArray(32);
	        return new web3_js.PublicKey(array);
	    };
	    BinaryWriter_1.prototype.writePubkey = function (value) {
	        const writer = this;
	        writer.writeFixedArray(value.toBuffer());
	    };
	    BinaryReader_1.prototype.readPubkeyAsString = function () {
	        const reader = this;
	        const array = reader.readFixedArray(32);
	        return bs58.encode(array);
	    };
	    BinaryWriter_1.prototype.writePubkeyAsString = function (value) {
	        const writer = this;
	        writer.writeFixedArray(bs58.decode(value));
	    };
	};
	extendBorsh();
	class Struct {
	    constructor(fields, dependencies = [], parse) {
	        this.dependencies = [];
	        this.fields = fields;
	        this.dependencies = dependencies;
	        this.type = class Type {
	            constructor(args = {}) {
	                for (const [name] of fields) {
	                    if (!(name in args)) {
	                        args[name] = undefined;
	                    }
	                }
	                parse && parse(args);
	                for (const key of Object.keys(args)) {
	                    this[key] = args[key];
	                }
	            }
	        };
	        const entries = [
	            [
	                this.type,
	                {
	                    kind: 'struct',
	                    fields,
	                },
	            ],
	        ];
	        for (const d of this.dependencies)
	            entries.push(...d.schema.entries());
	        this.schema = new Map(entries);
	    }
	    static create(fields, dependencies = [], parse) {
	        return new Struct(fields, dependencies, parse);
	    }
	    serialize(struct) {
	        return buffer.Buffer.from(serialize_1(this.schema, new this.type(struct)));
	    }
	    deserialize(buffer) {
	        return deserializeUnchecked_1(this.schema, this.type, buffer);
	    }
	}
	const struct = Struct.create;

	var borsh = /*#__PURE__*/Object.freeze({
		__proto__: null,
		extendBorsh: extendBorsh,
		Struct: Struct,
		struct: struct
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */

	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	/* eslint-env browser */

	// Ponyfill for `globalThis`
	const _globalThis = (() => {
		if (typeof globalThis !== 'undefined') {
			return globalThis;
		}

		if (typeof self !== 'undefined') {
			return self;
		}

		/* istanbul ignore next */
		if (typeof window !== 'undefined') {
			return window;
		}

		/* istanbul ignore next */
		if (typeof commonjsGlobal !== 'undefined') {
			return commonjsGlobal;
		}
	})();

	const bufferToHex = buffer => {
		const view = new DataView(buffer);

		let hexCodes = '';
		for (let i = 0; i < view.byteLength; i += 4) {
			hexCodes += view.getUint32(i).toString(16).padStart(8, '0');
		}

		return hexCodes;
	};

	const create = algorithm => async (buffer, options) => {
		if (typeof buffer === 'string') {
			buffer = new _globalThis.TextEncoder().encode(buffer);
		}

		options = {
			outputFormat: 'hex',
			...options
		};

		const hash = await _globalThis.crypto.subtle.digest(algorithm, buffer);

		return options.outputFormat === 'hex' ? bufferToHex(hash) : hash;
	};
	var sha256 = create('SHA-256');

	const getFileHash = (file) => __awaiter(void 0, void 0, void 0, function* () { return buffer.Buffer.from(yield sha256(file.toString())); });

	var crypto = /*#__PURE__*/Object.freeze({
		__proto__: null,
		getFileHash: getFileHash
	});

	var TupleNumericType;
	(function (TupleNumericType) {
	    TupleNumericType[TupleNumericType["U8"] = 1] = "U8";
	    TupleNumericType[TupleNumericType["U16"] = 2] = "U16";
	    TupleNumericType[TupleNumericType["U32"] = 4] = "U32";
	    TupleNumericType[TupleNumericType["U64"] = 8] = "U64";
	})(TupleNumericType || (TupleNumericType = {}));
	const getBNFromData = (data, offset, dataType) => {
	    switch (dataType) {
	        case TupleNumericType.U8:
	            return new BN(data[offset], 'le');
	        case TupleNumericType.U16:
	            return new BN(data.slice(offset, offset + 2), 'le');
	        case TupleNumericType.U32:
	            return new BN(data.slice(offset, offset + 4), 'le');
	        case TupleNumericType.U64:
	            return new BN(data.slice(offset, offset + 8), 'le');
	    }
	};

	var index = /*#__PURE__*/Object.freeze({
		__proto__: null,
		borsh: borsh,
		crypto: crypto,
		get TupleNumericType () { return TupleNumericType; },
		getBNFromData: getBNFromData
	});

	var ErrorCode;
	(function (ErrorCode) {
	    ErrorCode[ErrorCode["ERROR_INVALID_OWNER"] = 0] = "ERROR_INVALID_OWNER";
	    ErrorCode[ErrorCode["ERROR_INVALID_ACCOUNT_DATA"] = 1] = "ERROR_INVALID_ACCOUNT_DATA";
	    ErrorCode[ErrorCode["ERROR_DEPRECATED_ACCOUNT_DATA"] = 2] = "ERROR_DEPRECATED_ACCOUNT_DATA";
	})(ErrorCode || (ErrorCode = {}));
	class MetaplexError extends Error {
	    constructor(errorCode, message) {
	        super(message);
	        this.errorCode = errorCode;
	    }
	}
	const ERROR_INVALID_OWNER = () => {
	    return new MetaplexError(ErrorCode.ERROR_INVALID_OWNER, 'Invalid owner');
	};
	const ERROR_INVALID_ACCOUNT_DATA = () => {
	    return new MetaplexError(ErrorCode.ERROR_INVALID_ACCOUNT_DATA, 'Invalid data');
	};
	const ERROR_DEPRECATED_ACCOUNT_DATA = () => {
	    return new MetaplexError(ErrorCode.ERROR_DEPRECATED_ACCOUNT_DATA, 'Account data is deprecated');
	};

	var errors = /*#__PURE__*/Object.freeze({
		__proto__: null,
		get ErrorCode () { return ErrorCode; },
		MetaplexError: MetaplexError,
		ERROR_INVALID_OWNER: ERROR_INVALID_OWNER,
		ERROR_INVALID_ACCOUNT_DATA: ERROR_INVALID_ACCOUNT_DATA,
		ERROR_DEPRECATED_ACCOUNT_DATA: ERROR_DEPRECATED_ACCOUNT_DATA
	});

	exports.Currency = void 0;
	(function (Currency) {
	    Currency["USD"] = "usd";
	    Currency["EUR"] = "eur";
	    Currency["AR"] = "ar";
	    Currency["SOL"] = "sol";
	})(exports.Currency || (exports.Currency = {}));
	class ConversionRateProvider {
	}

	var axios$2 = {exports: {}};

	var bind$2 = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};

	var bind$1 = bind$2;

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is a Buffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Buffer, otherwise false
	 */
	function isBuffer(val) {
	  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
	    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a plain Object
	 *
	 * @param {Object} val The value to test
	 * @return {boolean} True if value is a plain Object, otherwise false
	 */
	function isPlainObject(val) {
	  if (toString.call(val) !== '[object Object]') {
	    return false;
	  }

	  var prototype = Object.getPrototypeOf(val);
	  return prototype === null || prototype === Object.prototype;
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 * nativescript
	 *  navigator.product -> 'NativeScript' or 'NS'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
	                                           navigator.product === 'NativeScript' ||
	                                           navigator.product === 'NS')) {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object') {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (isPlainObject(result[key]) && isPlainObject(val)) {
	      result[key] = merge(result[key], val);
	    } else if (isPlainObject(val)) {
	      result[key] = merge({}, val);
	    } else if (isArray(val)) {
	      result[key] = val.slice();
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind$1(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	/**
	 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	 *
	 * @param {string} content with BOM
	 * @return {string} content value without BOM
	 */
	function stripBOM(content) {
	  if (content.charCodeAt(0) === 0xFEFF) {
	    content = content.slice(1);
	  }
	  return content;
	}

	var utils$d = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isPlainObject: isPlainObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim,
	  stripBOM: stripBOM
	};

	var utils$c = utils$d;

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	var buildURL$2 = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils$c.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils$c.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils$c.isArray(val)) {
	        key = key + '[]';
	      } else {
	        val = [val];
	      }

	      utils$c.forEach(val, function parseValue(v) {
	        if (utils$c.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils$c.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    var hashmarkIndex = url.indexOf('#');
	    if (hashmarkIndex !== -1) {
	      url = url.slice(0, hashmarkIndex);
	    }

	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};

	var utils$b = utils$d;

	function InterceptorManager$1() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager$1.prototype.use = function use(fulfilled, rejected, options) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected,
	    synchronous: options ? options.synchronous : false,
	    runWhen: options ? options.runWhen : null
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager$1.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager$1.prototype.forEach = function forEach(fn) {
	  utils$b.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	var InterceptorManager_1 = InterceptorManager$1;

	var utils$a = utils$d;

	var normalizeHeaderName$1 = function normalizeHeaderName(headers, normalizedName) {
	  utils$a.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};

	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	var enhanceError$2 = function enhanceError(error, config, code, request, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }

	  error.request = request;
	  error.response = response;
	  error.isAxiosError = true;

	  error.toJSON = function toJSON() {
	    return {
	      // Standard
	      message: this.message,
	      name: this.name,
	      // Microsoft
	      description: this.description,
	      number: this.number,
	      // Mozilla
	      fileName: this.fileName,
	      lineNumber: this.lineNumber,
	      columnNumber: this.columnNumber,
	      stack: this.stack,
	      // Axios
	      config: this.config,
	      code: this.code
	    };
	  };
	  return error;
	};

	var enhanceError$1 = enhanceError$2;

	/**
	 * Create an Error with the specified message, config, error code, request and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	var createError$2 = function createError(message, config, code, request, response) {
	  var error = new Error(message);
	  return enhanceError$1(error, config, code, request, response);
	};

	var createError$1 = createError$2;

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	var settle$1 = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError$1(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response.request,
	      response
	    ));
	  }
	};

	var utils$9 = utils$d;

	var cookies$1 = (
	  utils$9.isStandardBrowserEnv() ?

	  // Standard browser envs support document.cookie
	    (function standardBrowserEnv() {
	      return {
	        write: function write(name, value, expires, path, domain, secure) {
	          var cookie = [];
	          cookie.push(name + '=' + encodeURIComponent(value));

	          if (utils$9.isNumber(expires)) {
	            cookie.push('expires=' + new Date(expires).toGMTString());
	          }

	          if (utils$9.isString(path)) {
	            cookie.push('path=' + path);
	          }

	          if (utils$9.isString(domain)) {
	            cookie.push('domain=' + domain);
	          }

	          if (secure === true) {
	            cookie.push('secure');
	          }

	          document.cookie = cookie.join('; ');
	        },

	        read: function read(name) {
	          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	          return (match ? decodeURIComponent(match[3]) : null);
	        },

	        remove: function remove(name) {
	          this.write(name, '', Date.now() - 86400000);
	        }
	      };
	    })() :

	  // Non standard browser env (web workers, react-native) lack needed support.
	    (function nonStandardBrowserEnv() {
	      return {
	        write: function write() {},
	        read: function read() { return null; },
	        remove: function remove() {}
	      };
	    })()
	);

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	var isAbsoluteURL$1 = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	var combineURLs$1 = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};

	var isAbsoluteURL = isAbsoluteURL$1;
	var combineURLs = combineURLs$1;

	/**
	 * Creates a new URL by combining the baseURL with the requestedURL,
	 * only when the requestedURL is not already an absolute URL.
	 * If the requestURL is absolute, this function returns the requestedURL untouched.
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} requestedURL Absolute or relative URL to combine
	 * @returns {string} The combined full path
	 */
	var buildFullPath$1 = function buildFullPath(baseURL, requestedURL) {
	  if (baseURL && !isAbsoluteURL(requestedURL)) {
	    return combineURLs(baseURL, requestedURL);
	  }
	  return requestedURL;
	};

	var utils$8 = utils$d;

	// Headers whose duplicates are ignored by node
	// c.f. https://nodejs.org/api/http.html#http_message_headers
	var ignoreDuplicateOf = [
	  'age', 'authorization', 'content-length', 'content-type', 'etag',
	  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
	  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
	  'referer', 'retry-after', 'user-agent'
	];

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	var parseHeaders$1 = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) { return parsed; }

	  utils$8.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils$8.trim(line.substr(0, i)).toLowerCase();
	    val = utils$8.trim(line.substr(i + 1));

	    if (key) {
	      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
	        return;
	      }
	      if (key === 'set-cookie') {
	        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
	      } else {
	        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	      }
	    }
	  });

	  return parsed;
	};

	var utils$7 = utils$d;

	var isURLSameOrigin$1 = (
	  utils$7.isStandardBrowserEnv() ?

	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	    (function standardBrowserEnv() {
	      var msie = /(msie|trident)/i.test(navigator.userAgent);
	      var urlParsingNode = document.createElement('a');
	      var originURL;

	      /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	      function resolveURL(url) {
	        var href = url;

	        if (msie) {
	        // IE needs attribute set twice to normalize properties
	          urlParsingNode.setAttribute('href', href);
	          href = urlParsingNode.href;
	        }

	        urlParsingNode.setAttribute('href', href);

	        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	        return {
	          href: urlParsingNode.href,
	          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	          host: urlParsingNode.host,
	          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	          hostname: urlParsingNode.hostname,
	          port: urlParsingNode.port,
	          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	            urlParsingNode.pathname :
	            '/' + urlParsingNode.pathname
	        };
	      }

	      originURL = resolveURL(window.location.href);

	      /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	      return function isURLSameOrigin(requestURL) {
	        var parsed = (utils$7.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	        return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	      };
	    })() :

	  // Non standard browser envs (web workers, react-native) lack needed support.
	    (function nonStandardBrowserEnv() {
	      return function isURLSameOrigin() {
	        return true;
	      };
	    })()
	);

	var utils$6 = utils$d;
	var settle = settle$1;
	var cookies = cookies$1;
	var buildURL$1 = buildURL$2;
	var buildFullPath = buildFullPath$1;
	var parseHeaders = parseHeaders$1;
	var isURLSameOrigin = isURLSameOrigin$1;
	var createError = createError$2;

	var xhr = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;
	    var responseType = config.responseType;

	    if (utils$6.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }

	    var request = new XMLHttpRequest();

	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }

	    var fullPath = buildFullPath(config.baseURL, config.url);
	    request.open(config.method.toUpperCase(), buildURL$1(fullPath, config.params, config.paramsSerializer), true);

	    // Set the request timeout in MS
	    request.timeout = config.timeout;

	    function onloadend() {
	      if (!request) {
	        return;
	      }
	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
	        request.responseText : request.response;
	      var response = {
	        data: responseData,
	        status: request.status,
	        statusText: request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };

	      settle(resolve, reject, response);

	      // Clean up request
	      request = null;
	    }

	    if ('onloadend' in request) {
	      // Use onloadend if available
	      request.onloadend = onloadend;
	    } else {
	      // Listen for ready state to emulate onloadend
	      request.onreadystatechange = function handleLoad() {
	        if (!request || request.readyState !== 4) {
	          return;
	        }

	        // The request errored out and we didn't get a response, this will be
	        // handled by onerror instead
	        // With one exception: request that using file: protocol, most browsers
	        // will return status as 0 even though it's a successful request
	        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	          return;
	        }
	        // readystate handler is calling before onerror or ontimeout handlers,
	        // so we should call onloadend on the next 'tick'
	        setTimeout(onloadend);
	      };
	    }

	    // Handle browser request cancellation (as opposed to a manual cancellation)
	    request.onabort = function handleAbort() {
	      if (!request) {
	        return;
	      }

	      reject(createError('Request aborted', config, 'ECONNABORTED', request));

	      // Clean up request
	      request = null;
	    };

	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config, null, request));

	      // Clean up request
	      request = null;
	    };

	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
	      if (config.timeoutErrorMessage) {
	        timeoutErrorMessage = config.timeoutErrorMessage;
	      }
	      reject(createError(
	        timeoutErrorMessage,
	        config,
	        config.transitional && config.transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
	        request));

	      // Clean up request
	      request = null;
	    };

	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils$6.isStandardBrowserEnv()) {
	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
	        cookies.read(config.xsrfCookieName) :
	        undefined;

	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }

	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils$6.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }

	    // Add withCredentials to request if needed
	    if (!utils$6.isUndefined(config.withCredentials)) {
	      request.withCredentials = !!config.withCredentials;
	    }

	    // Add responseType to request if needed
	    if (responseType && responseType !== 'json') {
	      request.responseType = config.responseType;
	    }

	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }

	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }

	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }

	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }

	    if (!requestData) {
	      requestData = null;
	    }

	    // Send the request
	    request.send(requestData);
	  });
	};

	var utils$5 = utils$d;
	var normalizeHeaderName = normalizeHeaderName$1;
	var enhanceError = enhanceError$2;

	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils$5.isUndefined(headers) && utils$5.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = xhr;
	  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
	    // For node use HTTP adapter
	    adapter = xhr;
	  }
	  return adapter;
	}

	function stringifySafely(rawValue, parser, encoder) {
	  if (utils$5.isString(rawValue)) {
	    try {
	      (parser || JSON.parse)(rawValue);
	      return utils$5.trim(rawValue);
	    } catch (e) {
	      if (e.name !== 'SyntaxError') {
	        throw e;
	      }
	    }
	  }

	  return (encoder || JSON.stringify)(rawValue);
	}

	var defaults$3 = {

	  transitional: {
	    silentJSONParsing: true,
	    forcedJSONParsing: true,
	    clarifyTimeoutError: false
	  },

	  adapter: getDefaultAdapter(),

	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Accept');
	    normalizeHeaderName(headers, 'Content-Type');

	    if (utils$5.isFormData(data) ||
	      utils$5.isArrayBuffer(data) ||
	      utils$5.isBuffer(data) ||
	      utils$5.isStream(data) ||
	      utils$5.isFile(data) ||
	      utils$5.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils$5.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils$5.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils$5.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
	      setContentTypeIfUnset(headers, 'application/json');
	      return stringifySafely(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    var transitional = this.transitional;
	    var silentJSONParsing = transitional && transitional.silentJSONParsing;
	    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
	    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

	    if (strictJSONParsing || (forcedJSONParsing && utils$5.isString(data) && data.length)) {
	      try {
	        return JSON.parse(data);
	      } catch (e) {
	        if (strictJSONParsing) {
	          if (e.name === 'SyntaxError') {
	            throw enhanceError(e, this, 'E_JSON_PARSE');
	          }
	          throw e;
	        }
	      }
	    }

	    return data;
	  }],

	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,
	  maxBodyLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};

	defaults$3.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};

	utils$5.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults$3.headers[method] = {};
	});

	utils$5.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults$3.headers[method] = utils$5.merge(DEFAULT_CONTENT_TYPE);
	});

	var defaults_1 = defaults$3;

	var utils$4 = utils$d;
	var defaults$2 = defaults_1;

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	var transformData$1 = function transformData(data, headers, fns) {
	  var context = this || defaults$2;
	  /*eslint no-param-reassign:0*/
	  utils$4.forEach(fns, function transform(fn) {
	    data = fn.call(context, data, headers);
	  });

	  return data;
	};

	var isCancel$1 = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};

	var utils$3 = utils$d;
	var transformData = transformData$1;
	var isCancel = isCancel$1;
	var defaults$1 = defaults_1;

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}

	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	var dispatchRequest$1 = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);

	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData.call(
	    config,
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils$3.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers
	  );

	  utils$3.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter = config.adapter || defaults$1.adapter;

	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);

	    // Transform response data
	    response.data = transformData.call(
	      config,
	      response.data,
	      response.headers,
	      config.transformResponse
	    );

	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);

	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData.call(
	          config,
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }

	    return Promise.reject(reason);
	  });
	};

	var utils$2 = utils$d;

	/**
	 * Config-specific merge-function which creates a new config-object
	 * by merging two configuration objects together.
	 *
	 * @param {Object} config1
	 * @param {Object} config2
	 * @returns {Object} New object resulting from merging config2 to config1
	 */
	var mergeConfig$2 = function mergeConfig(config1, config2) {
	  // eslint-disable-next-line no-param-reassign
	  config2 = config2 || {};
	  var config = {};

	  var valueFromConfig2Keys = ['url', 'method', 'data'];
	  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
	  var defaultToConfig2Keys = [
	    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
	    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
	    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
	    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
	    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
	  ];
	  var directMergeKeys = ['validateStatus'];

	  function getMergedValue(target, source) {
	    if (utils$2.isPlainObject(target) && utils$2.isPlainObject(source)) {
	      return utils$2.merge(target, source);
	    } else if (utils$2.isPlainObject(source)) {
	      return utils$2.merge({}, source);
	    } else if (utils$2.isArray(source)) {
	      return source.slice();
	    }
	    return source;
	  }

	  function mergeDeepProperties(prop) {
	    if (!utils$2.isUndefined(config2[prop])) {
	      config[prop] = getMergedValue(config1[prop], config2[prop]);
	    } else if (!utils$2.isUndefined(config1[prop])) {
	      config[prop] = getMergedValue(undefined, config1[prop]);
	    }
	  }

	  utils$2.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
	    if (!utils$2.isUndefined(config2[prop])) {
	      config[prop] = getMergedValue(undefined, config2[prop]);
	    }
	  });

	  utils$2.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

	  utils$2.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
	    if (!utils$2.isUndefined(config2[prop])) {
	      config[prop] = getMergedValue(undefined, config2[prop]);
	    } else if (!utils$2.isUndefined(config1[prop])) {
	      config[prop] = getMergedValue(undefined, config1[prop]);
	    }
	  });

	  utils$2.forEach(directMergeKeys, function merge(prop) {
	    if (prop in config2) {
	      config[prop] = getMergedValue(config1[prop], config2[prop]);
	    } else if (prop in config1) {
	      config[prop] = getMergedValue(undefined, config1[prop]);
	    }
	  });

	  var axiosKeys = valueFromConfig2Keys
	    .concat(mergeDeepPropertiesKeys)
	    .concat(defaultToConfig2Keys)
	    .concat(directMergeKeys);

	  var otherKeys = Object
	    .keys(config1)
	    .concat(Object.keys(config2))
	    .filter(function filterAxiosKeys(key) {
	      return axiosKeys.indexOf(key) === -1;
	    });

	  utils$2.forEach(otherKeys, mergeDeepProperties);

	  return config;
	};

	var name = "axios";
	var version = "0.21.4";
	var description = "Promise based HTTP client for the browser and node.js";
	var main = "index.js";
	var scripts = {
		test: "grunt test",
		start: "node ./sandbox/server.js",
		build: "NODE_ENV=production grunt build",
		preversion: "npm test",
		version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json",
		postversion: "git push && git push --tags",
		examples: "node ./examples/server.js",
		coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
		fix: "eslint --fix lib/**/*.js"
	};
	var repository = {
		type: "git",
		url: "https://github.com/axios/axios.git"
	};
	var keywords = [
		"xhr",
		"http",
		"ajax",
		"promise",
		"node"
	];
	var author = "Matt Zabriskie";
	var license = "MIT";
	var bugs = {
		url: "https://github.com/axios/axios/issues"
	};
	var homepage = "https://axios-http.com";
	var devDependencies = {
		coveralls: "^3.0.0",
		"es6-promise": "^4.2.4",
		grunt: "^1.3.0",
		"grunt-banner": "^0.6.0",
		"grunt-cli": "^1.2.0",
		"grunt-contrib-clean": "^1.1.0",
		"grunt-contrib-watch": "^1.0.0",
		"grunt-eslint": "^23.0.0",
		"grunt-karma": "^4.0.0",
		"grunt-mocha-test": "^0.13.3",
		"grunt-ts": "^6.0.0-beta.19",
		"grunt-webpack": "^4.0.2",
		"istanbul-instrumenter-loader": "^1.0.0",
		"jasmine-core": "^2.4.1",
		karma: "^6.3.2",
		"karma-chrome-launcher": "^3.1.0",
		"karma-firefox-launcher": "^2.1.0",
		"karma-jasmine": "^1.1.1",
		"karma-jasmine-ajax": "^0.1.13",
		"karma-safari-launcher": "^1.0.0",
		"karma-sauce-launcher": "^4.3.6",
		"karma-sinon": "^1.0.5",
		"karma-sourcemap-loader": "^0.3.8",
		"karma-webpack": "^4.0.2",
		"load-grunt-tasks": "^3.5.2",
		minimist: "^1.2.0",
		mocha: "^8.2.1",
		sinon: "^4.5.0",
		"terser-webpack-plugin": "^4.2.3",
		typescript: "^4.0.5",
		"url-search-params": "^0.10.0",
		webpack: "^4.44.2",
		"webpack-dev-server": "^3.11.0"
	};
	var browser = {
		"./lib/adapters/http.js": "./lib/adapters/xhr.js"
	};
	var jsdelivr = "dist/axios.min.js";
	var unpkg = "dist/axios.min.js";
	var typings = "./index.d.ts";
	var dependencies = {
		"follow-redirects": "^1.14.0"
	};
	var bundlesize = [
		{
			path: "./dist/axios.min.js",
			threshold: "5kB"
		}
	];
	var require$$0 = {
		name: name,
		version: version,
		description: description,
		main: main,
		scripts: scripts,
		repository: repository,
		keywords: keywords,
		author: author,
		license: license,
		bugs: bugs,
		homepage: homepage,
		devDependencies: devDependencies,
		browser: browser,
		jsdelivr: jsdelivr,
		unpkg: unpkg,
		typings: typings,
		dependencies: dependencies,
		bundlesize: bundlesize
	};

	var pkg = require$$0;

	var validators$1 = {};

	// eslint-disable-next-line func-names
	['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
	  validators$1[type] = function validator(thing) {
	    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
	  };
	});

	var deprecatedWarnings = {};
	var currentVerArr = pkg.version.split('.');

	/**
	 * Compare package versions
	 * @param {string} version
	 * @param {string?} thanVersion
	 * @returns {boolean}
	 */
	function isOlderVersion(version, thanVersion) {
	  var pkgVersionArr = thanVersion ? thanVersion.split('.') : currentVerArr;
	  var destVer = version.split('.');
	  for (var i = 0; i < 3; i++) {
	    if (pkgVersionArr[i] > destVer[i]) {
	      return true;
	    } else if (pkgVersionArr[i] < destVer[i]) {
	      return false;
	    }
	  }
	  return false;
	}

	/**
	 * Transitional option validator
	 * @param {function|boolean?} validator
	 * @param {string?} version
	 * @param {string} message
	 * @returns {function}
	 */
	validators$1.transitional = function transitional(validator, version, message) {
	  var isDeprecated = version && isOlderVersion(version);

	  function formatMessage(opt, desc) {
	    return '[Axios v' + pkg.version + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
	  }

	  // eslint-disable-next-line func-names
	  return function(value, opt, opts) {
	    if (validator === false) {
	      throw new Error(formatMessage(opt, ' has been removed in ' + version));
	    }

	    if (isDeprecated && !deprecatedWarnings[opt]) {
	      deprecatedWarnings[opt] = true;
	      // eslint-disable-next-line no-console
	      console.warn(
	        formatMessage(
	          opt,
	          ' has been deprecated since v' + version + ' and will be removed in the near future'
	        )
	      );
	    }

	    return validator ? validator(value, opt, opts) : true;
	  };
	};

	/**
	 * Assert object's properties type
	 * @param {object} options
	 * @param {object} schema
	 * @param {boolean?} allowUnknown
	 */

	function assertOptions(options, schema, allowUnknown) {
	  if (typeof options !== 'object') {
	    throw new TypeError('options must be an object');
	  }
	  var keys = Object.keys(options);
	  var i = keys.length;
	  while (i-- > 0) {
	    var opt = keys[i];
	    var validator = schema[opt];
	    if (validator) {
	      var value = options[opt];
	      var result = value === undefined || validator(value, opt, options);
	      if (result !== true) {
	        throw new TypeError('option ' + opt + ' must be ' + result);
	      }
	      continue;
	    }
	    if (allowUnknown !== true) {
	      throw Error('Unknown option ' + opt);
	    }
	  }
	}

	var validator$1 = {
	  isOlderVersion: isOlderVersion,
	  assertOptions: assertOptions,
	  validators: validators$1
	};

	var utils$1 = utils$d;
	var buildURL = buildURL$2;
	var InterceptorManager = InterceptorManager_1;
	var dispatchRequest = dispatchRequest$1;
	var mergeConfig$1 = mergeConfig$2;
	var validator = validator$1;

	var validators = validator.validators;
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios$1(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios$1.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = arguments[1] || {};
	    config.url = arguments[0];
	  } else {
	    config = config || {};
	  }

	  config = mergeConfig$1(this.defaults, config);

	  // Set config.method
	  if (config.method) {
	    config.method = config.method.toLowerCase();
	  } else if (this.defaults.method) {
	    config.method = this.defaults.method.toLowerCase();
	  } else {
	    config.method = 'get';
	  }

	  var transitional = config.transitional;

	  if (transitional !== undefined) {
	    validator.assertOptions(transitional, {
	      silentJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
	      forcedJSONParsing: validators.transitional(validators.boolean, '1.0.0'),
	      clarifyTimeoutError: validators.transitional(validators.boolean, '1.0.0')
	    }, false);
	  }

	  // filter out skipped interceptors
	  var requestInterceptorChain = [];
	  var synchronousRequestInterceptors = true;
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
	      return;
	    }

	    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

	    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  var responseInterceptorChain = [];
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  var promise;

	  if (!synchronousRequestInterceptors) {
	    var chain = [dispatchRequest, undefined];

	    Array.prototype.unshift.apply(chain, requestInterceptorChain);
	    chain = chain.concat(responseInterceptorChain);

	    promise = Promise.resolve(config);
	    while (chain.length) {
	      promise = promise.then(chain.shift(), chain.shift());
	    }

	    return promise;
	  }


	  var newConfig = config;
	  while (requestInterceptorChain.length) {
	    var onFulfilled = requestInterceptorChain.shift();
	    var onRejected = requestInterceptorChain.shift();
	    try {
	      newConfig = onFulfilled(newConfig);
	    } catch (error) {
	      onRejected(error);
	      break;
	    }
	  }

	  try {
	    promise = dispatchRequest(newConfig);
	  } catch (error) {
	    return Promise.reject(error);
	  }

	  while (responseInterceptorChain.length) {
	    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
	  }

	  return promise;
	};

	Axios$1.prototype.getUri = function getUri(config) {
	  config = mergeConfig$1(this.defaults, config);
	  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
	};

	// Provide aliases for supported request methods
	utils$1.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios$1.prototype[method] = function(url, config) {
	    return this.request(mergeConfig$1(config || {}, {
	      method: method,
	      url: url,
	      data: (config || {}).data
	    }));
	  };
	});

	utils$1.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios$1.prototype[method] = function(url, data, config) {
	    return this.request(mergeConfig$1(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});

	var Axios_1 = Axios$1;

	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel$1(message) {
	  this.message = message;
	}

	Cancel$1.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};

	Cancel$1.prototype.__CANCEL__ = true;

	var Cancel_1 = Cancel$1;

	var Cancel = Cancel_1;

	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }

	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });

	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }

	    token.reason = new Cancel(message);
	    resolvePromise(token.reason);
	  });
	}

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};

	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};

	var CancelToken_1 = CancelToken;

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	var spread = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};

	/**
	 * Determines whether the payload is an error thrown by Axios
	 *
	 * @param {*} payload The value to test
	 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
	 */
	var isAxiosError = function isAxiosError(payload) {
	  return (typeof payload === 'object') && (payload.isAxiosError === true);
	};

	var utils = utils$d;
	var bind = bind$2;
	var Axios = Axios_1;
	var mergeConfig = mergeConfig$2;
	var defaults = defaults_1;

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);

	  // Copy context to instance
	  utils.extend(instance, context);

	  return instance;
	}

	// Create the default instance to be exported
	var axios$1 = createInstance(defaults);

	// Expose Axios class to allow class inheritance
	axios$1.Axios = Axios;

	// Factory for creating new instances
	axios$1.create = function create(instanceConfig) {
	  return createInstance(mergeConfig(axios$1.defaults, instanceConfig));
	};

	// Expose Cancel & CancelToken
	axios$1.Cancel = Cancel_1;
	axios$1.CancelToken = CancelToken_1;
	axios$1.isCancel = isCancel$1;

	// Expose all/spread
	axios$1.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios$1.spread = spread;

	// Expose isAxiosError
	axios$1.isAxiosError = isAxiosError;

	axios$2.exports = axios$1;

	// Allow use of default import syntax in TypeScript
	axios$2.exports.default = axios$1;

	var axios = axios$2.exports;

	class Coingecko {
	    constructor() { }
	    static translateCurrency(currency) {
	        switch (currency) {
	            case exports.Currency.AR:
	                return 'arweave';
	            case exports.Currency.SOL:
	                return 'solana';
	            case exports.Currency.USD:
	                return 'usd';
	            case exports.Currency.EUR:
	                return 'eur';
	            default:
	                throw new Error('Invalid currency supplied to Coingecko conversion rate provider');
	        }
	    }
	    getRate(from, to) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const fromArray = typeof from === 'string' ? [from] : from;
	            const toArray = typeof to === 'string' ? [to] : to;
	            const fromIds = fromArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
	            const toIds = toArray.map((currency) => Coingecko.translateCurrency(currency)).join(',');
	            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${fromIds}&vs_currencies=${toIds}`;
	            const response = yield axios(url);
	            const data = yield response.data;
	            return fromArray.reduce((previousPairs, fromCurrency) => {
	                return [
	                    ...previousPairs,
	                    ...toArray.map((toCurrency) => ({
	                        from: fromCurrency,
	                        to: toCurrency,
	                        rate: data[Coingecko.translateCurrency(fromCurrency)][Coingecko.translateCurrency(toCurrency)],
	                    })),
	                ];
	            }, []);
	        });
	    }
	}

	const ARWEAVE_URL = 'https://arweave.net';
	const LAMPORT_MULTIPLIER = Math.pow(10, 9);
	const WINSTON_MULTIPLIER = Math.pow(10, 12);
	class ArweaveStorage {
	    constructor({ endpoint, env }) {
	        this.endpoint = endpoint;
	        this.env = env;
	    }
	    getAssetCostToStore(files, arweaveRate, solanaRate) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const buffers = Array.from(files.values());
	            const totalBytes = buffers.reduce((sum, f) => (sum += f.byteLength), 0);
	            const txnFeeInWinstons = parseInt(yield (yield axios(`${ARWEAVE_URL}/price/0`)).data);
	            const byteCostInWinstons = parseInt(yield (yield axios(`${ARWEAVE_URL}/price/${totalBytes.toString()}`)).data);
	            const totalArCost = (txnFeeInWinstons * buffers.length + byteCostInWinstons) / WINSTON_MULTIPLIER;
	            const arMultiplier = arweaveRate / solanaRate;
	            return LAMPORT_MULTIPLIER * totalArCost * arMultiplier * 1.1;
	        });
	    }
	    upload(files, mintKey, txid) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const fileEntries = Array.from(files.entries());
	            fileEntries.reduce((acc, f) => {
	                acc[f[0]] = [{ name: 'mint', value: mintKey }];
	                return acc;
	            }, {});
	            return {};
	        });
	    }
	}

	exports.ChainId = void 0;
	(function (ChainId) {
	    ChainId[ChainId["MainnetBeta"] = 101] = "MainnetBeta";
	    ChainId[ChainId["Testnet"] = 102] = "Testnet";
	    ChainId[ChainId["Devnet"] = 103] = "Devnet";
	})(exports.ChainId || (exports.ChainId = {}));
	const ENV = {
	    'mainnet-beta': {
	        endpoint: 'https://api.metaplex.solana.com/',
	        ChainId: exports.ChainId.MainnetBeta,
	    },
	    'mainnet-beta (Solana)': {
	        endpoint: 'https://api.mainnet-beta.solana.com',
	        ChainId: exports.ChainId.MainnetBeta,
	    },
	    'mainnet-beta (Serum)': {
	        endpoint: 'https://solana-api.projectserum.com/',
	        ChainId: exports.ChainId.MainnetBeta,
	    },
	    testnet: {
	        endpoint: web3_js.clusterApiUrl('testnet'),
	        ChainId: exports.ChainId.Testnet,
	    },
	    devnet: {
	        endpoint: web3_js.clusterApiUrl('devnet'),
	        ChainId: exports.ChainId.Devnet,
	    },
	};
	class Connection extends web3_js.Connection {
	    constructor(endpoint = 'mainnet-beta', commitment) {
	        if (endpoint in ENV)
	            endpoint = ENV[endpoint].endpoint;
	        super(endpoint, commitment);
	    }
	}

	class Account {
	    constructor(pubkey, info) {
	        this.pubkey = new web3_js.PublicKey(pubkey);
	        this.info = info;
	    }
	    static from(account) {
	        return new this(account.pubkey, account.info);
	    }
	    static load(connection, pubkey) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const info = yield Account.getInfo(connection, pubkey);
	            return new this(pubkey, info);
	        });
	    }
	    static isCompatible(data) {
	        throw new Error(`method 'isCompatible' is not implemented`);
	    }
	    static getInfo(connection, pubkey) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const info = yield connection.getAccountInfo(new web3_js.PublicKey(pubkey));
	            if (!info) {
	                throw new Error(`Unable to find account: ${pubkey}`);
	            }
	            return Object.assign(Object.assign({}, info), { data: buffer.Buffer.from(info === null || info === void 0 ? void 0 : info.data) });
	        });
	    }
	    static getInfos(connection, pubkeys, commitment = 'recent') {
	        return __awaiter(this, void 0, void 0, function* () {
	            const BATCH_SIZE = 99;
	            const promises = [];
	            for (let i = 0; i < pubkeys.length; i += BATCH_SIZE) {
	                promises.push(Account.getMultipleAccounts(connection, pubkeys.slice(i, Math.min(pubkeys.length, i + BATCH_SIZE)), commitment));
	            }
	            const results = new Map();
	            (yield Promise.all(promises)).forEach((result) => { var _a; return [...((_a = result === null || result === void 0 ? void 0 : result.entries()) !== null && _a !== void 0 ? _a : [])].forEach(([k, v]) => results.set(k, v)); });
	            return results;
	        });
	    }
	    static getMultipleAccounts(connection, pubkeys, commitment) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const args = connection._buildArgs([pubkeys.map((k) => k.toString())], commitment, 'base64');
	            const unsafeRes = yield connection._rpcRequest('getMultipleAccounts', args);
	            if (unsafeRes.error) {
	                throw new Error('failed to get info about accounts ' + unsafeRes.error.message);
	            }
	            if (!unsafeRes.result.value)
	                return;
	            const infos = unsafeRes.result.value.map((info) => (Object.assign(Object.assign({}, info), { data: buffer.Buffer.from(info.data[0], 'base64') })));
	            return infos.reduce((acc, info, index) => {
	                acc.set(pubkeys[index], info);
	                return acc;
	            }, new Map());
	        });
	    }
	    assertOwner(pubkey) {
	        var _a;
	        return (_a = this.info) === null || _a === void 0 ? void 0 : _a.owner.equals(new web3_js.PublicKey(pubkey));
	    }
	    toJSON() {
	        var _a, _b, _c, _d, _e;
	        return {
	            pubkey: this.pubkey.toString(),
	            info: {
	                executable: !!((_a = this.info) === null || _a === void 0 ? void 0 : _a.executable),
	                owner: ((_b = this.info) === null || _b === void 0 ? void 0 : _b.owner) ? new web3_js.PublicKey((_c = this.info) === null || _c === void 0 ? void 0 : _c.owner) : null,
	                lamports: (_d = this.info) === null || _d === void 0 ? void 0 : _d.lamports,
	                data: (_e = this.info) === null || _e === void 0 ? void 0 : _e.data.toJSON(),
	            },
	            data: this.data,
	        };
	    }
	    toString() {
	        return JSON.stringify(this.toJSON());
	    }
	}

	const config = {
	    arweaveWallet: 'HvwC9QSAzvGXhhVrgPmauVwFWcYZhne3hVot9EbHuFTm',
	    programs: {
	        auction: 'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
	        metadata: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
	        metaplex: 'p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98',
	        vault: 'vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn',
	        memo: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
	    },
	};

	class Program$5 extends Account {
	    findProgramAddress(seeds) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield web3_js.PublicKey.findProgramAddress(seeds, this.pubkey))[0];
	        });
	    }
	    getProgramAccounts(connection, configOrCommitment) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield connection.getProgramAccounts(this.pubkey, configOrCommitment)).map(({ pubkey, account }) => new Account(pubkey, account));
	        });
	    }
	}

	class AuctionProgram extends Program$5 {
	    constructor() {
	        super(AuctionProgram.PUBKEY);
	    }
	}
	AuctionProgram.PREFIX = 'auction';
	AuctionProgram.EXTENDED = 'extended';
	AuctionProgram.PUBKEY = new web3_js.PublicKey(config.programs.auction);
	var Program$4 = new AuctionProgram();

	const bidderMetadataStruct = struct([
	    ['bidderPubkey', 'pubkeyAsString'],
	    ['auctionPubkey', 'pubkeyAsString'],
	    ['lastBid', 'u64'],
	    ['lastBidTimestamp', 'u64'],
	    ['cancelled', 'u8'],
	]);
	class BidderMetadata extends Account {
	    constructor(key, info) {
	        super(key, info);
	        if (!this.assertOwner(Program$4.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!BidderMetadata.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = bidderMetadataStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data.length === BidderMetadata.DATA_SIZE;
	    }
	}
	BidderMetadata.DATA_SIZE = 32 + 32 + 8 + 8 + 1;

	const bidderPotStruct = struct([
	    ['bidderPot', 'pubkeyAsString'],
	    ['bidderAct', 'pubkeyAsString'],
	    ['auctionAct', 'pubkeyAsString'],
	    ['emptied', 'u8'],
	]);
	class BidderPot extends Account {
	    constructor(key, info) {
	        super(key, info);
	        this.PROGRAM = Program$4;
	        if (!this.assertOwner(Program$4.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!BidderPot.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = bidderPotStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data.length === BidderPot.DATA_SIZE;
	    }
	}
	BidderPot.DATA_SIZE = 32 + 32 + 32 + 1;

	exports.AuctionState = void 0;
	(function (AuctionState) {
	    AuctionState[AuctionState["Created"] = 0] = "Created";
	    AuctionState[AuctionState["Started"] = 1] = "Started";
	    AuctionState[AuctionState["Ended"] = 2] = "Ended";
	})(exports.AuctionState || (exports.AuctionState = {}));
	exports.BidStateType = void 0;
	(function (BidStateType) {
	    BidStateType[BidStateType["EnglishAuction"] = 0] = "EnglishAuction";
	    BidStateType[BidStateType["OpenEdition"] = 1] = "OpenEdition";
	})(exports.BidStateType || (exports.BidStateType = {}));
	exports.PriceFloorType = void 0;
	(function (PriceFloorType) {
	    PriceFloorType[PriceFloorType["None"] = 0] = "None";
	    PriceFloorType[PriceFloorType["Minimum"] = 1] = "Minimum";
	    PriceFloorType[PriceFloorType["BlindedPrice"] = 2] = "BlindedPrice";
	})(exports.PriceFloorType || (exports.PriceFloorType = {}));
	const bidStruct = struct([
	    ['key', 'pubkeyAsString'],
	    ['amount', 'u64'],
	]);
	const bidStateStruct = struct([
	    ['type', 'u8'],
	    ['bids', [bidStruct.type]],
	    ['max', 'u64'],
	], [bidStruct]);
	const priceFloorStruct = struct([
	    ['type', 'u8'],
	    ['hash', [32]],
	], [], (data) => {
	    if (!data.hash)
	        data.hash = new Uint8Array(32);
	    if (data.type === exports.PriceFloorType.Minimum) {
	        if (data.minPrice) {
	            data.hash.set(data.minPrice.toArrayLike(buffer.Buffer, 'le', 8), 0);
	        }
	        else {
	            data.minPrice = new BN((data.hash || new Uint8Array(0)).slice(0, 8), 'le');
	        }
	    }
	    return data;
	});
	const auctionDataStruct = struct([
	    ['authority', 'pubkeyAsString'],
	    ['tokenMint', 'pubkeyAsString'],
	    ['lastBid', { kind: 'option', type: 'u64' }],
	    ['endedAt', { kind: 'option', type: 'u64' }],
	    ['endAuctionAt', { kind: 'option', type: 'u64' }],
	    ['auctionGap', { kind: 'option', type: 'u64' }],
	    ['priceFloor', priceFloorStruct.type],
	    ['state', 'u8'],
	    ['bidState', bidStateStruct.type],
	], [priceFloorStruct, bidStateStruct]);
	class Auction extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$4.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        this.data = auctionDataStruct.deserialize(this.info.data);
	    }
	    static getPDA(vault) {
	        return Program$4.findProgramAddress([
	            buffer.Buffer.from(AuctionProgram.PREFIX),
	            AuctionProgram.PUBKEY.toBuffer(),
	            new web3_js.PublicKey(vault).toBuffer(),
	        ]);
	    }
	    getBidderPots(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$4.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        dataSize: BidderPot.DATA_SIZE,
	                    },
	                    {
	                        memcmp: {
	                            offset: 32 + 32,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => BidderPot.from(account));
	        });
	    }
	    getBidderMetadata(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$4.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        dataSize: BidderMetadata.DATA_SIZE,
	                    },
	                    {
	                        memcmp: {
	                            offset: 32,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => BidderMetadata.from(account));
	        });
	    }
	}
	Auction.EXTENDED_DATA_SIZE = 8 + 9 + 2 + 200;

	const auctionDataExtendedStruct = struct([
	    ['totalUncancelledBids', 'u64'],
	    ['tickSize', { kind: 'option', type: 'u64' }],
	    ['gapTickSizePercentage', { kind: 'option', type: 'u8' }],
	]);
	class AuctionExtended extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$4.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!AuctionExtended.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = auctionDataExtendedStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data.length === AuctionExtended.DATA_SIZE;
	    }
	    static getPDA(vault) {
	        return Program$4.findProgramAddress([
	            buffer.Buffer.from(AuctionProgram.PREFIX),
	            AuctionProgram.PUBKEY.toBuffer(),
	            new web3_js.PublicKey(vault).toBuffer(),
	            buffer.Buffer.from(AuctionProgram.EXTENDED),
	        ]);
	    }
	}
	AuctionExtended.DATA_SIZE = 8 + 9 + 2 + 200;

	exports.MetadataKey = void 0;
	(function (MetadataKey) {
	    MetadataKey[MetadataKey["Uninitialized"] = 0] = "Uninitialized";
	    MetadataKey[MetadataKey["MetadataV1"] = 4] = "MetadataV1";
	    MetadataKey[MetadataKey["EditionV1"] = 1] = "EditionV1";
	    MetadataKey[MetadataKey["MasterEditionV1"] = 2] = "MasterEditionV1";
	    MetadataKey[MetadataKey["MasterEditionV2"] = 6] = "MasterEditionV2";
	    MetadataKey[MetadataKey["EditionMarker"] = 7] = "EditionMarker";
	})(exports.MetadataKey || (exports.MetadataKey = {}));
	class MetadataProgram extends Program$5 {
	    constructor() {
	        super(MetadataProgram.PUBKEY);
	    }
	}
	MetadataProgram.PREFIX = 'metadata';
	MetadataProgram.PUBKEY = new web3_js.PublicKey(config.programs.metadata);
	var Program$3 = new MetadataProgram();

	const editionStruct = struct([
	    ['key', 'u8'],
	    ['parent', 'pubkeyAsString'],
	    ['edition', 'u64'],
	], [], (data) => {
	    data.key = exports.MetadataKey.EditionV1;
	    return data;
	});
	class Edition extends Account {
	    constructor(key, info) {
	        super(key, info);
	        if (!this.assertOwner(Program$3.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!Edition.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = editionStruct.deserialize(this.info.data);
	    }
	    static getPDA(mint) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$3.findProgramAddress([
	                buffer.Buffer.from(MetadataProgram.PREFIX),
	                MetadataProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	                buffer.Buffer.from(Edition.EDITION_PREFIX),
	            ]);
	        });
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetadataKey.EditionV1;
	    }
	}
	Edition.EDITION_PREFIX = 'edition';

	const editionMarkerStruct = struct([
	    ['key', 'u8'],
	    ['ledger', [31]],
	], [], (data) => {
	    data.key = exports.MetadataKey.EditionMarker;
	    return data;
	});
	class EditionMarker extends Account {
	    constructor(key, info) {
	        super(key, info);
	        if (!this.assertOwner(Program$3.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!EditionMarker.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = editionMarkerStruct.deserialize(this.info.data);
	    }
	    static getPDA(mint, edition) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const editionNumber = Math.floor(edition.toNumber() / 248);
	            return Program$3.findProgramAddress([
	                buffer.Buffer.from(MetadataProgram.PREFIX),
	                MetadataProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	                buffer.Buffer.from(Edition.EDITION_PREFIX),
	                buffer.Buffer.from(editionNumber.toString()),
	            ]);
	        });
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetadataKey.EditionMarker;
	    }
	}

	const masterEditionV2Struct = struct([
	    ['key', 'u8'],
	    ['supply', 'u64'],
	    ['maxSupply', { kind: 'option', type: 'u64' }],
	], [], (data) => {
	    data.key = exports.MetadataKey.MasterEditionV2;
	    return data;
	});
	const masterEditionV1Struct = struct([
	    ...masterEditionV2Struct.fields,
	    ['printingMint', 'pubkeyAsString'],
	    ['oneTimePrintingAuthorizationMint', 'pubkeyAsString'],
	], [], (data) => {
	    data.key = exports.MetadataKey.MasterEditionV1;
	    return data;
	});
	class MasterEdition extends Account {
	    constructor(key, info) {
	        super(key, info);
	        if (!this.assertOwner(Program$3.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (MasterEdition.isMasterEditionV1(this.info.data)) {
	            this.data = masterEditionV1Struct.deserialize(this.info.data);
	        }
	        else if (MasterEdition.isMasterEditionV2(this.info.data)) {
	            this.data = masterEditionV2Struct.deserialize(this.info.data);
	        }
	        else {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	    }
	    static getPDA(mint) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$3.findProgramAddress([
	                buffer.Buffer.from(MetadataProgram.PREFIX),
	                MetadataProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	                buffer.Buffer.from(MasterEdition.EDITION_PREFIX),
	            ]);
	        });
	    }
	    static isCompatible(data) {
	        return MasterEdition.isMasterEditionV1(data) || MasterEdition.isMasterEditionV2(data);
	    }
	    static isMasterEditionV1(data) {
	        return data[0] === exports.MetadataKey.MasterEditionV1;
	    }
	    static isMasterEditionV2(data) {
	        return data[0] === exports.MetadataKey.MasterEditionV2;
	    }
	    getEditions(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$3.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.MetadataKey.EditionV1])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: 1,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => Edition.from(account));
	        });
	    }
	}
	MasterEdition.EDITION_PREFIX = 'edition';

	const creatorStruct = struct([
	    ['address', 'pubkeyAsString'],
	    ['verified', 'u8'],
	    ['share', 'u8'],
	]);
	const dataDataStruct = struct([
	    ['name', 'string'],
	    ['symbol', 'string'],
	    ['uri', 'string'],
	    ['sellerFeeBasisPoints', 'u16'],
	    ['creators', { kind: 'option', type: [creatorStruct.type] }],
	], [creatorStruct], (data) => {
	    const METADATA_REPLACE = new RegExp('\u0000', 'g');
	    data.name = data.name.replace(METADATA_REPLACE, '');
	    data.uri = data.uri.replace(METADATA_REPLACE, '');
	    data.symbol = data.symbol.replace(METADATA_REPLACE, '');
	    return data;
	});
	const dataStruct = struct([
	    ['key', 'u8'],
	    ['updateAuthority', 'pubkeyAsString'],
	    ['mint', 'pubkeyAsString'],
	    ['data', dataDataStruct.type],
	    ['primarySaleHappened', 'u8'],
	    ['isMutable', 'u8'],
	], [dataDataStruct]);
	class Metadata extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$3.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!Metadata.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = dataStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetadataKey.MetadataV1;
	    }
	    static getPDA(mint) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$3.findProgramAddress([
	                buffer.Buffer.from(MetadataProgram.PREFIX),
	                MetadataProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	            ]);
	        });
	    }
	    getEdition(connection) {
	        var _a;
	        return __awaiter(this, void 0, void 0, function* () {
	            const mint = (_a = this.data) === null || _a === void 0 ? void 0 : _a.mint;
	            if (!mint)
	                return;
	            const pda = yield Edition.getPDA(mint);
	            const info = yield Account.getInfo(connection, pda);
	            const key = info === null || info === void 0 ? void 0 : info.data[0];
	            switch (key) {
	                case exports.MetadataKey.EditionV1:
	                    return new Edition(pda, info);
	                case exports.MetadataKey.MasterEditionV1:
	                case exports.MetadataKey.MasterEditionV2:
	                    return new MasterEdition(pda, info);
	                default:
	                    return;
	            }
	        });
	    }
	}

	exports.MetaplexKey = void 0;
	(function (MetaplexKey) {
	    MetaplexKey[MetaplexKey["Uninitialized"] = 0] = "Uninitialized";
	    MetaplexKey[MetaplexKey["OriginalAuthorityLookupV1"] = 1] = "OriginalAuthorityLookupV1";
	    MetaplexKey[MetaplexKey["BidRedemptionTicketV1"] = 2] = "BidRedemptionTicketV1";
	    MetaplexKey[MetaplexKey["StoreV1"] = 3] = "StoreV1";
	    MetaplexKey[MetaplexKey["WhitelistedCreatorV1"] = 4] = "WhitelistedCreatorV1";
	    MetaplexKey[MetaplexKey["PayoutTicketV1"] = 5] = "PayoutTicketV1";
	    MetaplexKey[MetaplexKey["SafetyDepositValidationTicketV1"] = 6] = "SafetyDepositValidationTicketV1";
	    MetaplexKey[MetaplexKey["AuctionManagerV1"] = 7] = "AuctionManagerV1";
	    MetaplexKey[MetaplexKey["PrizeTrackingTicketV1"] = 8] = "PrizeTrackingTicketV1";
	    MetaplexKey[MetaplexKey["SafetyDepositConfigV1"] = 9] = "SafetyDepositConfigV1";
	    MetaplexKey[MetaplexKey["AuctionManagerV2"] = 10] = "AuctionManagerV2";
	    MetaplexKey[MetaplexKey["BidRedemptionTicketV2"] = 11] = "BidRedemptionTicketV2";
	    MetaplexKey[MetaplexKey["AuctionWinnerTokenTypeTrackerV1"] = 12] = "AuctionWinnerTokenTypeTrackerV1";
	})(exports.MetaplexKey || (exports.MetaplexKey = {}));
	class MetaplexProgram extends Program$5 {
	    constructor() {
	        super(MetaplexProgram.PUBKEY);
	    }
	}
	MetaplexProgram.PREFIX = 'metaplex';
	MetaplexProgram.PUBKEY = new web3_js.PublicKey(config.programs.metaplex);
	var Program$2 = new MetaplexProgram();

	const WINNER_INDEX_OFFSETS = [2, 10];
	class BidRedemptionTicket extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (BidRedemptionTicket.isBidRedemptionTicketV1(this.info.data)) {
	            throw ERROR_DEPRECATED_ACCOUNT_DATA();
	        }
	        else if (BidRedemptionTicket.isBidRedemptionTicketV2(this.info.data)) {
	            const data = this.info.data.toJSON().data;
	            const winnerIndex = data[1] !== 0 && new BN(data.slice(1, 9), 'le');
	            const offset = WINNER_INDEX_OFFSETS[+!!winnerIndex];
	            this.data = {
	                key: exports.MetaplexKey.BidRedemptionTicketV2,
	                winnerIndex,
	                data,
	                auctionManager: bs58.encode(data.slice(offset, offset + 32)),
	            };
	        }
	        else {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	    }
	    static isCompatible(data) {
	        return (BidRedemptionTicket.isBidRedemptionTicketV1(data) ||
	            BidRedemptionTicket.isBidRedemptionTicketV2(data));
	    }
	    static isBidRedemptionTicketV1(data) {
	        return data[0] === exports.MetaplexKey.BidRedemptionTicketV1;
	    }
	    static isBidRedemptionTicketV2(data) {
	        return data[0] === exports.MetaplexKey.BidRedemptionTicketV2;
	    }
	}

	exports.AuctionManagerStatus = void 0;
	(function (AuctionManagerStatus) {
	    AuctionManagerStatus[AuctionManagerStatus["Initialized"] = 0] = "Initialized";
	    AuctionManagerStatus[AuctionManagerStatus["Validated"] = 1] = "Validated";
	    AuctionManagerStatus[AuctionManagerStatus["Running"] = 2] = "Running";
	    AuctionManagerStatus[AuctionManagerStatus["Disbursing"] = 3] = "Disbursing";
	    AuctionManagerStatus[AuctionManagerStatus["Finished"] = 4] = "Finished";
	})(exports.AuctionManagerStatus || (exports.AuctionManagerStatus = {}));
	const AuctionManagerStateV2Struct = struct([
	    ['status', 'u8'],
	    ['safetyConfigItemsValidated', 'u64'],
	    ['bidsPushedToAcceptPayment', 'u64'],
	    ['hasParticipation', 'u8'],
	], [], (data) => Object.assign({
	    status: exports.AuctionManagerStatus.Initialized,
	    safetyConfigItemsValidated: new BN(0),
	    bidsPushedToAcceptPayment: new BN(0),
	    hasParticipation: false,
	}, data));
	const AuctionManagerV2Struct = struct([
	    ['key', 'u8'],
	    ['store', 'pubkeyAsString'],
	    ['authority', 'pubkeyAsString'],
	    ['auction', 'pubkeyAsString'],
	    ['vault', 'pubkeyAsString'],
	    ['acceptPayment', 'pubkeyAsString'],
	    ['state', AuctionManagerStateV2Struct.type],
	], [AuctionManagerStateV2Struct], (data) => {
	    data.key = exports.MetaplexKey.AuctionManagerV2;
	    return data;
	});
	class AuctionManager extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (AuctionManager.isAuctionManagerV1(this.info.data)) {
	            throw ERROR_DEPRECATED_ACCOUNT_DATA();
	        }
	        else if (AuctionManager.isAuctionManagerV2(this.info.data)) {
	            this.data = AuctionManagerV2Struct.deserialize(this.info.data);
	        }
	        else {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	    }
	    static isCompatible(data) {
	        return AuctionManager.isAuctionManagerV1(data) || AuctionManager.isAuctionManagerV2(data);
	    }
	    static isAuctionManagerV1(data) {
	        return data[0] === exports.MetaplexKey.AuctionManagerV1;
	    }
	    static isAuctionManagerV2(data) {
	        return data[0] === exports.MetaplexKey.AuctionManagerV2;
	    }
	    static getPDA(auction) {
	        return Program$2.findProgramAddress([
	            buffer.Buffer.from(MetaplexProgram.PREFIX),
	            new web3_js.PublicKey(auction).toBuffer(),
	        ]);
	    }
	    getAuction(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Auction.load(connection, this.data.auction);
	        });
	    }
	    getBidRedemptionTickets(connection, haveWinnerIndex = true) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$2.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.MetaplexKey.BidRedemptionTicketV2])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: WINNER_INDEX_OFFSETS[+haveWinnerIndex],
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => BidRedemptionTicket.from(account));
	        });
	    }
	}

	const payoutTicketStruct = struct([
	    ['key', 'u8'],
	    ['recipient', 'pubkeyAsString'],
	    ['amountPaid', 'u64'],
	], [], (data) => {
	    data.key = exports.MetaplexKey.PayoutTicketV1;
	    return data;
	});
	class PayoutTicket extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!PayoutTicket.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = payoutTicketStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetaplexKey.PayoutTicketV1;
	    }
	    static getPayoutTicketsByRecipient(connection, recipient) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$2.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.MetaplexKey.PayoutTicketV1])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: 1,
	                            bytes: new web3_js.PublicKey(recipient).toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => PayoutTicket.from(account));
	        });
	    }
	}

	const prizeTrackingTicketStruct = struct([
	    ['key', 'u8'],
	    ['metadata', 'pubkeyAsString'],
	    ['supplySnapshot', 'u64'],
	    ['expectedRedemptions', 'u64'],
	    ['redemptions', 'u64'],
	], [], (data) => {
	    data.key = exports.MetaplexKey.PrizeTrackingTicketV1;
	    return data;
	});
	class PrizeTrackingTicket extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!PrizeTrackingTicket.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = prizeTrackingTicketStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetaplexKey.PrizeTrackingTicketV1;
	    }
	    static getPDA(auctionManager, mint) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$2.findProgramAddress([
	                buffer.Buffer.from(MetaplexProgram.PREFIX),
	                MetaplexProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(auctionManager).toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	            ]);
	        });
	    }
	}

	exports.WinningConfigType = void 0;
	(function (WinningConfigType) {
	    WinningConfigType[WinningConfigType["TokenOnlyTransfer"] = 0] = "TokenOnlyTransfer";
	    WinningConfigType[WinningConfigType["FullRightsTransfer"] = 1] = "FullRightsTransfer";
	    WinningConfigType[WinningConfigType["PrintingV1"] = 2] = "PrintingV1";
	    WinningConfigType[WinningConfigType["PrintingV2"] = 3] = "PrintingV2";
	    WinningConfigType[WinningConfigType["Participation"] = 4] = "Participation";
	})(exports.WinningConfigType || (exports.WinningConfigType = {}));
	exports.WinningConstraint = void 0;
	(function (WinningConstraint) {
	    WinningConstraint[WinningConstraint["NoParticipationPrize"] = 0] = "NoParticipationPrize";
	    WinningConstraint[WinningConstraint["ParticipationPrizeGiven"] = 1] = "ParticipationPrizeGiven";
	})(exports.WinningConstraint || (exports.WinningConstraint = {}));
	exports.NonWinningConstraint = void 0;
	(function (NonWinningConstraint) {
	    NonWinningConstraint[NonWinningConstraint["NoParticipationPrize"] = 0] = "NoParticipationPrize";
	    NonWinningConstraint[NonWinningConstraint["GivenForFixedPrice"] = 1] = "GivenForFixedPrice";
	    NonWinningConstraint[NonWinningConstraint["GivenForBidPrice"] = 2] = "GivenForBidPrice";
	})(exports.NonWinningConstraint || (exports.NonWinningConstraint = {}));
	class SafetyDepositConfig extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!SafetyDepositConfig.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetaplexKey.SafetyDepositConfigV1;
	    }
	    static getPDA(auctionManager, safetyDeposit) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$2.findProgramAddress([
	                buffer.Buffer.from(MetaplexProgram.PREFIX),
	                MetaplexProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(auctionManager).toBuffer(),
	                new web3_js.PublicKey(safetyDeposit).toBuffer(),
	            ]);
	        });
	    }
	}
	const deserialize = (buffer) => {
	    const data = {
	        key: exports.MetaplexKey.SafetyDepositConfigV1,
	        auctionManager: bs58.encode(buffer.slice(1, 33)),
	        order: new BN(buffer.slice(33, 41), 'le'),
	        winningConfigType: buffer[41],
	        amountType: buffer[42],
	        lengthType: buffer[43],
	        amountRanges: [],
	        participationConfig: null,
	        participationState: null,
	    };
	    const lengthOfArray = new BN(buffer.slice(44, 48), 'le');
	    let offset = 48;
	    for (let i = 0; i < lengthOfArray.toNumber(); i++) {
	        const amount = getBNFromData(buffer, offset, data.amountType);
	        offset += data.amountType;
	        const length = getBNFromData(buffer, offset, data.lengthType);
	        offset += data.lengthType;
	        data.amountRanges.push({ amount, length });
	    }
	    if (buffer[offset] == 0) {
	        offset += 1;
	        data.participationConfig = null;
	    }
	    else {
	        const winnerConstraint = buffer[offset + 1];
	        const nonWinningConstraint = buffer[offset + 2];
	        let fixedPrice = null;
	        offset += 3;
	        if (buffer[offset] == 1) {
	            fixedPrice = new BN(buffer.slice(offset + 1, offset + 9), 'le');
	            offset += 9;
	        }
	        else {
	            offset += 1;
	        }
	        data.participationConfig = {
	            winnerConstraint,
	            nonWinningConstraint,
	            fixedPrice,
	        };
	    }
	    if (buffer[offset] == 0) {
	        offset += 1;
	        data.participationState = null;
	    }
	    else {
	        const collectedToAcceptPayment = new BN(buffer.slice(offset + 1, offset + 9), 'le');
	        offset += 9;
	        data.participationState = {
	            collectedToAcceptPayment,
	        };
	    }
	    return data;
	};

	const whitelistedCreatorStruct = struct([
	    ['key', 'u8'],
	    ['address', 'pubkeyAsString'],
	    ['activated', 'u8'],
	], [], (data) => Object.assign({ activated: true }, data, {
	    key: exports.MetaplexKey.WhitelistedCreatorV1,
	}));
	class WhitelistedCreator extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!WhitelistedCreator.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = whitelistedCreatorStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetaplexKey.WhitelistedCreatorV1;
	    }
	    static getPDA(store, creator) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$2.findProgramAddress([
	                buffer.Buffer.from(MetaplexProgram.PREFIX),
	                MetaplexProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(store).toBuffer(),
	                new web3_js.PublicKey(creator).toBuffer(),
	            ]);
	        });
	    }
	}

	const storeStruct = struct([
	    ['key', 'u8'],
	    ['public', 'u8'],
	    ['auctionProgram', 'pubkeyAsString'],
	    ['tokenVaultProgram', 'pubkeyAsString'],
	    ['tokenMetadataProgram', 'pubkeyAsString'],
	    ['tokenProgram', 'pubkeyAsString'],
	], [], (data) => Object.assign({ public: true }, data, { key: exports.MetaplexKey.StoreV1 }));
	class Store extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$2.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!Store.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = storeStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.MetaplexKey.StoreV1;
	    }
	    static getPDA(owner) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$2.findProgramAddress([
	                buffer.Buffer.from(MetaplexProgram.PREFIX),
	                MetaplexProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(owner).toBuffer(),
	            ]);
	        });
	    }
	    getWhitelistedCreators(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$2.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.MetaplexKey.WhitelistedCreatorV1])),
	                        },
	                    },
	                ],
	            })).map((account) => WhitelistedCreator.from(account));
	        });
	    }
	    getAuctionManagers(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$2.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.MetaplexKey.AuctionManagerV2])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: 1,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => AuctionManager.from(account));
	        });
	    }
	}

	class Transaction extends web3_js.Transaction {
	    constructor(options) {
	        super(options);
	    }
	    static fromCombined(transactions) {
	        const combinedTransaction = new Transaction({});
	        transactions.forEach((transaction) => transaction.instructions.forEach((instruction) => {
	            combinedTransaction.add(instruction);
	        }));
	        return combinedTransaction;
	    }
	}

	exports.VaultKey = void 0;
	(function (VaultKey) {
	    VaultKey[VaultKey["Uninitialized"] = 0] = "Uninitialized";
	    VaultKey[VaultKey["VaultV1"] = 3] = "VaultV1";
	    VaultKey[VaultKey["SafetyDepositBoxV1"] = 1] = "SafetyDepositBoxV1";
	    VaultKey[VaultKey["ExternalPriceAccountV1"] = 2] = "ExternalPriceAccountV1";
	})(exports.VaultKey || (exports.VaultKey = {}));
	class VaultProgram extends Program$5 {
	    constructor() {
	        super(VaultProgram.PUBKEY);
	    }
	}
	VaultProgram.PREFIX = 'vault';
	VaultProgram.PUBKEY = new web3_js.PublicKey(config.programs.vault);
	var Program$1 = new VaultProgram();

	const safetyDepositStruct = struct([
	    ['key', 'u8'],
	    ['vault', 'pubkeyAsString'],
	    ['tokenMint', 'pubkeyAsString'],
	    ['store', 'pubkeyAsString'],
	    ['order', 'u8'],
	], [], (data) => {
	    data.key = exports.VaultKey.SafetyDepositBoxV1;
	    return data;
	});
	class SafetyDepositBox extends Account {
	    constructor(key, info) {
	        super(key, info);
	        if (!this.assertOwner(Program$1.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!SafetyDepositBox.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = safetyDepositStruct.deserialize(this.info.data);
	    }
	    static getPDA(vault, mint) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$1.findProgramAddress([
	                buffer.Buffer.from(VaultProgram.PREFIX),
	                new web3_js.PublicKey(vault).toBuffer(),
	                new web3_js.PublicKey(mint).toBuffer(),
	            ]);
	        });
	    }
	    static isCompatible(data) {
	        return data[0] === exports.VaultKey.SafetyDepositBoxV1;
	    }
	}

	exports.VaultState = void 0;
	(function (VaultState) {
	    VaultState[VaultState["Inactive"] = 0] = "Inactive";
	    VaultState[VaultState["Active"] = 1] = "Active";
	    VaultState[VaultState["Combined"] = 2] = "Combined";
	    VaultState[VaultState["Deactivated"] = 3] = "Deactivated";
	})(exports.VaultState || (exports.VaultState = {}));
	const vaultStruct = struct([
	    ['key', 'u8'],
	    ['tokenProgram', 'pubkeyAsString'],
	    ['fractionMint', 'pubkeyAsString'],
	    ['authority', 'pubkeyAsString'],
	    ['fractionTreasury', 'pubkeyAsString'],
	    ['redeemTreasury', 'pubkeyAsString'],
	    ['allowFurtherShareCreation', 'u8'],
	    ['pricingLookupAddress', 'pubkeyAsString'],
	    ['tokenTypeCount', 'u8'],
	    ['state', 'u8'],
	    ['lockedPricePerShare', 'u64'],
	], [], (data) => {
	    data.key = exports.VaultKey.VaultV1;
	    return data;
	});
	class Vault extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program$1.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!Vault.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = vaultStruct.deserialize(this.info.data);
	    }
	    static getPDA(pubkey) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return Program$1.findProgramAddress([
	                buffer.Buffer.from(VaultProgram.PREFIX),
	                VaultProgram.PUBKEY.toBuffer(),
	                new web3_js.PublicKey(pubkey).toBuffer(),
	            ]);
	        });
	    }
	    static isCompatible(data) {
	        return data[0] === exports.VaultKey.VaultV1;
	    }
	    getSafetyDepositBoxes(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program$1.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.VaultKey.SafetyDepositBoxV1])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: 1,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => SafetyDepositBox.from(account));
	        });
	    }
	}

	const setStoreStruct = struct([
	    ['instruction', 'u8'],
	    ['public', 'u8'],
	]);
	class SetStore extends Transaction {
	    constructor(options, params) {
	        super(options);
	        const { feePayer } = options;
	        const { admin, store, isPublic } = params;
	        const data = setStoreStruct.serialize({ instruction: 8, public: isPublic });
	        this.add(new web3_js.TransactionInstruction({
	            keys: [
	                {
	                    pubkey: store,
	                    isSigner: false,
	                    isWritable: true,
	                },
	                {
	                    pubkey: admin,
	                    isSigner: true,
	                    isWritable: false,
	                },
	                {
	                    pubkey: feePayer,
	                    isSigner: true,
	                    isWritable: false,
	                },
	                { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
	                {
	                    pubkey: VaultProgram.PUBKEY,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: MetadataProgram.PUBKEY,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: AuctionProgram.PUBKEY,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: web3_js.SystemProgram.programId,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: web3_js.SYSVAR_RENT_PUBKEY,
	                    isSigner: false,
	                    isWritable: false,
	                },
	            ],
	            programId: MetaplexProgram.PUBKEY,
	            data,
	        }));
	    }
	}

	exports.NFTPacksAccountType = void 0;
	(function (NFTPacksAccountType) {
	    NFTPacksAccountType[NFTPacksAccountType["Uninitialized"] = 0] = "Uninitialized";
	    NFTPacksAccountType[NFTPacksAccountType["PackSet"] = 1] = "PackSet";
	    NFTPacksAccountType[NFTPacksAccountType["PackCard"] = 2] = "PackCard";
	    NFTPacksAccountType[NFTPacksAccountType["PackVoucher"] = 3] = "PackVoucher";
	    NFTPacksAccountType[NFTPacksAccountType["ProvingProcess"] = 4] = "ProvingProcess";
	})(exports.NFTPacksAccountType || (exports.NFTPacksAccountType = {}));
	class NFTPacksProgram extends Program$5 {
	    constructor() {
	        super(NFTPacksProgram.PUBKEY);
	    }
	}
	NFTPacksProgram.PREFIX = 'packs';
	NFTPacksProgram.PUBKEY = new web3_js.PublicKey('BNRmGgciUJuyznkYHnmitA9an1BcDDiU9JmjEQwvBYVR');
	var Program = new NFTPacksProgram();

	exports.DistributionType = void 0;
	(function (DistributionType) {
	    DistributionType[DistributionType["FixedNumber"] = 0] = "FixedNumber";
	    DistributionType[DistributionType["ProbabilityBased"] = 1] = "ProbabilityBased";
	})(exports.DistributionType || (exports.DistributionType = {}));
	const distributionStruct = struct([
	    ['type', 'u8'],
	    ['value', 'u64'],
	]);
	const packCardStruct = struct([
	    ['accountType', 'u8'],
	    ['packSet', 'pubkeyAsString'],
	    ['master', 'pubkeyAsString'],
	    ['metadata', 'pubkeyAsString'],
	    ['tokenAccount', 'pubkeyAsString'],
	    ['maxSupply', { kind: 'option', type: 'u32' }],
	    ['distribution', distributionStruct.type],
	    ['currentSupply', 'u32'],
	], [distributionStruct], (data) => {
	    data.accountType = exports.NFTPacksAccountType.PackCard;
	    return data;
	});
	class PackCard extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!PackCard.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = packCardStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.NFTPacksAccountType.PackCard;
	    }
	    static getPDA(packSet, index) {
	        return Program.findProgramAddress([
	            buffer.Buffer.from(PackCard.PREFIX),
	            new web3_js.PublicKey(packSet).toBuffer(),
	            buffer.Buffer.from(index.toString()),
	        ]);
	    }
	}
	PackCard.PREFIX = 'card';

	exports.PackSetState = void 0;
	(function (PackSetState) {
	    PackSetState[PackSetState["NotActivated"] = 0] = "NotActivated";
	    PackSetState[PackSetState["Activated"] = 1] = "Activated";
	    PackSetState[PackSetState["Deactivated"] = 2] = "Deactivated";
	})(exports.PackSetState || (exports.PackSetState = {}));
	const packSetStruct = struct([
	    ['accountType', 'u8'],
	    ['name', [32]],
	    ['authority', 'pubkeyAsString'],
	    ['mintingAuthority', 'pubkeyAsString'],
	    ['totalPacks', 'u32'],
	    ['packCards', 'u32'],
	    ['packVouchers', 'u32'],
	    ['mutable', 'u8'],
	    ['state', 'u8'],
	], [], (data) => {
	    data.accountType = exports.NFTPacksAccountType.PackSet;
	    data.name = String.fromCharCode.apply(null, data.name).replace(/\0.*$/g, '');
	    data.state = data.state;
	    return data;
	});
	class PackSet extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!PackSet.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = packSetStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.NFTPacksAccountType.PackSet;
	    }
	    getCards(connection) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield Program.getProgramAccounts(connection, {
	                filters: [
	                    {
	                        memcmp: {
	                            offset: 0,
	                            bytes: bs58.encode(buffer.Buffer.from([exports.NFTPacksAccountType.PackCard])),
	                        },
	                    },
	                    {
	                        memcmp: {
	                            offset: 1,
	                            bytes: this.pubkey.toBase58(),
	                        },
	                    },
	                ],
	            })).map((account) => PackCard.from(account));
	        });
	    }
	}

	exports.ActionOnProve = void 0;
	(function (ActionOnProve) {
	    ActionOnProve[ActionOnProve["Burn"] = 0] = "Burn";
	    ActionOnProve[ActionOnProve["Redeem"] = 1] = "Redeem";
	})(exports.ActionOnProve || (exports.ActionOnProve = {}));
	const packVoucherStruct = struct([
	    ['accountType', 'u8'],
	    ['packSet', 'pubkeyAsString'],
	    ['master', 'pubkeyAsString'],
	    ['metadata', 'pubkeyAsString'],
	    ['tokenAccount', 'pubkeyAsString'],
	    ['maxSupply', { kind: 'option', type: 'u32' }],
	    ['currentSupply', 'u32'],
	    ['numberToOpen', 'u32'],
	    ['actionOnProve', 'u8'],
	], [], (data) => {
	    data.accountType = exports.NFTPacksAccountType.PackVoucher;
	    return data;
	});
	class PackVoucher extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!PackVoucher.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = packVoucherStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.NFTPacksAccountType.PackVoucher;
	    }
	    static getPDA(packSet, index) {
	        return Program.findProgramAddress([
	            buffer.Buffer.from(PackVoucher.PREFIX),
	            new web3_js.PublicKey(packSet).toBuffer(),
	            buffer.Buffer.from(index.toString()),
	        ]);
	    }
	}
	PackVoucher.PREFIX = 'voucher';

	const provingProcessStruct = struct([
	    ['accountType', 'u8'],
	    ['userWallet', 'pubkeyAsString'],
	    ['packSet', 'pubkeyAsString'],
	    ['provedVouchers', 'u32'],
	    ['provedVoucherEditions', 'u32'],
	    ['claimedCards', 'u32'],
	    ['claimedCardEditions', 'u32'],
	], [], (data) => {
	    data.accountType = exports.NFTPacksAccountType.ProvingProcess;
	    return data;
	});
	class ProvingProcess extends Account {
	    constructor(pubkey, info) {
	        super(pubkey, info);
	        if (!this.assertOwner(Program.pubkey)) {
	            throw ERROR_INVALID_OWNER();
	        }
	        if (!ProvingProcess.isCompatible(this.info.data)) {
	            throw ERROR_INVALID_ACCOUNT_DATA();
	        }
	        this.data = provingProcessStruct.deserialize(this.info.data);
	    }
	    static isCompatible(data) {
	        return data[0] === exports.NFTPacksAccountType.ProvingProcess;
	    }
	    static getPDA(packSet, userWallet) {
	        return Program.findProgramAddress([
	            buffer.Buffer.from(ProvingProcess.PREFIX),
	            new web3_js.PublicKey(packSet).toBuffer(),
	            new web3_js.PublicKey(userWallet).toBuffer(),
	        ]);
	    }
	}
	ProvingProcess.PREFIX = 'proving';

	class PayForFiles extends Transaction {
	    constructor(options, params) {
	        const { feePayer } = options;
	        const { lamports, fileHashes, arweaveWallet } = params;
	        super(options);
	        this.add(web3_js.SystemProgram.transfer({
	            fromPubkey: feePayer,
	            toPubkey: arweaveWallet !== null && arweaveWallet !== void 0 ? arweaveWallet : new web3_js.PublicKey(config.arweaveWallet),
	            lamports,
	        }));
	        fileHashes.forEach((data) => {
	            this.add(new web3_js.TransactionInstruction({
	                keys: [],
	                programId: new web3_js.PublicKey(config.programs.memo),
	                data,
	            }));
	        });
	    }
	}

	class CreateMint extends Transaction {
	    constructor(options, params) {
	        const { feePayer } = options;
	        const { newAccountPubkey, lamports, decimals, owner, freezeAuthority } = params;
	        super(options);
	        this.add(web3_js.SystemProgram.createAccount({
	            fromPubkey: feePayer,
	            newAccountPubkey: newAccountPubkey,
	            lamports,
	            space: splToken.MintLayout.span,
	            programId: splToken.TOKEN_PROGRAM_ID,
	        }));
	        this.add(splToken.Token.createInitMintInstruction(splToken.TOKEN_PROGRAM_ID, newAccountPubkey, decimals !== null && decimals !== void 0 ? decimals : 0, owner !== null && owner !== void 0 ? owner : feePayer, freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : feePayer));
	    }
	}

	class CreateAssociatedTokenAccount extends Transaction {
	    constructor(options, params) {
	        const { feePayer } = options;
	        const { associatedTokenAddress, walletAddress, splTokenMintAddress } = params;
	        super(options);
	        this.add(new web3_js.TransactionInstruction({
	            keys: [
	                {
	                    pubkey: feePayer,
	                    isSigner: true,
	                    isWritable: true,
	                },
	                {
	                    pubkey: associatedTokenAddress,
	                    isSigner: false,
	                    isWritable: true,
	                },
	                {
	                    pubkey: walletAddress !== null && walletAddress !== void 0 ? walletAddress : feePayer,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: splTokenMintAddress,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: web3_js.SystemProgram.programId,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: splToken.TOKEN_PROGRAM_ID,
	                    isSigner: false,
	                    isWritable: false,
	                },
	                {
	                    pubkey: web3_js.SYSVAR_RENT_PUBKEY,
	                    isSigner: false,
	                    isWritable: false,
	                },
	            ],
	            programId: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
	            data: buffer.Buffer.from([]),
	        }));
	    }
	}

	exports.ArweaveStorage = ArweaveStorage;
	exports.Auction = Auction;
	exports.AuctionExtended = AuctionExtended;
	exports.AuctionManager = AuctionManager;
	exports.AuctionProgram = AuctionProgram;
	exports.BidRedemptionTicket = BidRedemptionTicket;
	exports.BidderMetadata = BidderMetadata;
	exports.BidderPot = BidderPot;
	exports.Coingecko = Coingecko;
	exports.Connection = Connection;
	exports.ConversionRateProvider = ConversionRateProvider;
	exports.CreateAssociatedTokenAccount = CreateAssociatedTokenAccount;
	exports.CreateMint = CreateMint;
	exports.ENV = ENV;
	exports.Edition = Edition;
	exports.EditionMarker = EditionMarker;
	exports.Errors = errors;
	exports.MasterEdition = MasterEdition;
	exports.Metadata = Metadata;
	exports.MetadataProgram = MetadataProgram;
	exports.MetaplexProgram = MetaplexProgram;
	exports.NFTPacksProgram = NFTPacksProgram;
	exports.PackCard = PackCard;
	exports.PackSet = PackSet;
	exports.PackVoucher = PackVoucher;
	exports.PayForFiles = PayForFiles;
	exports.PayoutTicket = PayoutTicket;
	exports.PrizeTrackingTicket = PrizeTrackingTicket;
	exports.ProvingProcess = ProvingProcess;
	exports.SafetyDepositBox = SafetyDepositBox;
	exports.SafetyDepositConfig = SafetyDepositConfig;
	exports.SetStore = SetStore;
	exports.Store = Store;
	exports.Transaction = Transaction;
	exports.Utils = index;
	exports.Vault = Vault;
	exports.VaultProgram = VaultProgram;
	exports.WINNER_INDEX_OFFSETS = WINNER_INDEX_OFFSETS;
	exports.WhitelistedCreator = WhitelistedCreator;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}, solanaWeb3, splToken));
//# sourceMappingURL=index.iife.js.map
