ivar.require('ivar/html.js');
ivar.require('ivar.test.*');
ivar.require('ivar.patt.Events');
ivar.require('ivar.data.StringTree');
ivar.require('ivar.data.Graph');
ivar.require('ivar.data.Map');
ivar.require('http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js');
ivar.require('ivar.net.Communication');

function assertFalse(bool) {
	console.error(!bool);
}

function assertTrue(bool) {
	console.error(bool);
}

function test() {
	ivar.echo(a);
	ivar.echo(b);
	
	var m = new ivar.data.Map({a: 1, b: 2, c:3, f:4, g:5, e:6});
	m.sort()
	while(m.hasNext()) {
		console.log(m.nextKey());
		console.log(m.next());
	}
	
	while(m.hasPrevious()) {
		console.log(m.previousKey());
		console.log(m.previous());
	}
	
	a = {
	'a':1,
	'b':{
		'c':[1,2,[3,45],4,5],
		'd':{
			'q':1, 
			'b':{
				'q':1, 
				'b':8},
			'c':4
			},
		'u':'lol', 
	},
	'e':2
	};
	
	b = {
		'a':1, 
		'b':{
			'c':[2,3,[1]],
			'd':{
				'q':3, 
				'b':{'b':3}
			}
		},
		'e':2
		};
	c = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	
	var hc = new HashCache();
	hc.put({a:1, b:1});
	hc.put({b:1, a:1});
	hc.put(true);
	hc.put('true');
	hc.put(a)
	console.log(hc.exists(b))
	console.log(hc.exists(a))
	console.log(hc.exists(c))
	hc.remove(a)
	console.log(ivar.crc32('true'))
	hc.put(c)
	console.log(ivar.crc32(true.toString()))
	
}

function HashTable() {
	var values = [];
	var keys = [];
	
	function store(hash, val) {
	
		var found = find(hash)
		var id = keys.length
		
		if (found > -1)
			id = found
		
		keys[next] = hash
		values[next] = [].push(val)
	}
	
	function del(id) {
		
	}
	
	function find(hash) {
		for (var i = 0; i < keys.length; i++) {
			if(keys[i] === hash)
				return i
		}
		return -1
	}
	
	function hash(key) {
	
	}
	
	this.put = function(key, value) {
		var hash = hash(key);
		store(hash, [key, value])
	}
	
	this.get = function(key) {
		var hash = hash(key);
	}
	
	this.remove = function() {
	
	}
}

/**
 * A hash table value value storage
 * Use it to quickly and resource efficiently find large objects or large strings in a very large collection. It uses CRC32 algorythm to convert supplied values into integer hashes and 
 * 
 * @author Nikola Stamatovic Stamat < stamat@ivartech.com >
 * @copyright ivartech < http://ivartech.com >
 * @version 1.0
 * @date 2013-07-02
 */
 
/**
 * @example
 	a = {'a':1,
		'b':{'c':[1,2,[3,45],4,5],
			'd':{'q':1, 'b':{q':1, 'b':8},'c':4},
			'u':'lol'},
		'e':2};
	
	b = {'a':1, 
		'b':{'c':[2,3,[1]],
			'd':{'q':3,'b':{'b':3}}},
		'e':2};
		
	c = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	
	var hc = new HashCache();
	hc.put({a:1, b:1});
	hc.put({b:1, a:1});
	hc.put(true);
	hc.put('true');
	hc.put(a)
	console.log(hc.exists(b))
	console.log(hc.exists(a))
	console.log(hc.exists(c))
	hc.remove(a)
	console.log(hc.exists(a))
	hc.put(c)
	console.log(hc.exists(c))
	
 * @class
 * @param	{array}	a	An array of values to store on init
 */
function HashCache(a) {
	
	/**
	 * Keeps values in arrays labeled under typewise crc32 hashes
	 *
	 * @this	HashCache
	 * @protected
	 */
	var storage = {}
	
	/**
	 * Type modifier
	 *
	 * @this	HashCache
	 * @protected
	 */
	var types = {
		'integer': 0,
		'float': 0,
		'string': 1,
		'array': 2,
		'object': 3,
		'function': 4,
		'regexp': 5,
		'date': 6,
		'null': 7,
		'undefined': 8,
		'boolean': 9
	}
	
	/**
	 * Produces an integer hash of a given value
	 * Note that this is typewise hashing, because crc32 hashes strings, and boolean true would be the same as string 'true' or a sting '123' would be the same as integer 123, etc... So according to type the final crc hash is multiplied by 10 and the type modifier ranging from 0-9 is being added. If the object is passed, before JSON stringification the properties are ordered.
	 *
	 * @this 	HashCache
	 * @protected
	 * @param	{any}	value 	Any value to be hashed
	 * @return	{integer}		Integer hash
	 *
	 * @see 	sortProperties
	 * @see 	whatis
	 * @see 	HashCache.types
	 */	
	var hashFn = function(value) {
		var type = types[ivar.whatis(value)];
		
		if (type === 2 || type === 3) {
			if(type === 3)
				value = ivar.sortProperties(value);
			value = JSON.stringify(value);
		} else if(type === 6) {
			value = value.getTime();
		} else {
			value = value.toString();
		}
			
		var h = ivar.crc32(value);
		return	h*10+type;
	};
	
	/**
	 * Checks if the value is stored under the selected hash key.
	 * Under the same hash can be stored one or more values, this happens due to hash collisions and entries other then first element of the array are called overflow entries.
	 *
	 * @this	HashCache
	 * @protected
	 *
	 * @param	{integer}	hash	Hash of the value
	 * @param	{any}		value	Submited value
	 * @return	{boolean}			Returns if the value is listed under its hash in HashCache instance
	 *
	 * @see HashCache.storage
	 */
	var hashHoldsValue = function(hash, value) {
		var bucket = storage[hash]
		if (bucket) {
			if (bucket.length > 1) {
				for (var i = 0; i < bucket.length; i++) {
					if(ivar.equals(bucket[i], value))
						return true;
				}
			} else if (bucket.length === 1) {
				return true;
			}
		}
		return false
	};
	
	/**
	 * Hashes the value and stores it in the hash table where the generated hash is a key
	 *
	 * @this {HashCache}
	 * @public
	 * @param	{any}	value 	Any value to be stored
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.hashHoldsValue
	 * @see HashCache.storage
	 */
	this.put = function(value) {
		var hash = hashFn(value);
		if(!hashHoldsValue(hash, value)) {
			if (storage.hasOwnProperty(hash)) {
				storage[hash].push(value);
			} else {
				storage[hash] = [value];
			}
		}
	}
	
	/**
	 * Checks if the value is listed in HashCache instance
	 *
	 * @this	HashCache
	 * @public
	 * @param	{any}	value 	Any value to be checked
	 * @return	{boolean}		If the value is listed
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.hashHoldsValue
	 */
	this.exists = function(value) {
		var hash = hashFn(value);
		return hashHoldsValue(hash, value);
	}
	
	/**
	 * Finds the value listed and removes it from the HashCache instance
	 *
	 * @this	HashCache
	 * @public
	 * @param	{any}	value 	Any value to be removed
	 * @return 	{boolean}		If the value existed and was removed
	 *
	 * @see	HashCache.hashFn
	 * @see HashCache.storage
	 */
	this.remove = function(value) {
		var hash = hashFn(value);
		var bucket = storage[hash];
		var res = false;
		if(bucket) {
			if(bucket.length > 1) {
				for (var i = 0; i < bucket.length; i++) {
					if(ivar.equals(bucket[i], value)) {
						storage[hash].splice(i, 1);
						res = true;
					}
				}
			} else {
				delete storage[hash];
				res = true;
			}
		}
		return res;
	}
	
	if (a !== undefined) { 
		if (ivar.whatis(a) === 'array') {
			for (var i = 0; i < a.length; i++) {
				this.put(a[i]);
			}
		}
	}
}

function asd() {
	var test = ['omgzlol','omfg','lol'];
	var test1 = ['omgzlol','rofl','zlol', 'yolo'];
	var test2 = ['rofl'];
	var st = new ivar.data.StringTree();
	st.put(test);
	st.put(test1);
	st.put(test2);
	//st.put('omg');
	//st.put('foo');
	//st.put('fool');
	
	var out = ivar.def({
		'int': function(a) {
			alert('Here is int '+a);
		},
		
		'float': function(a) {
			alert('Here is float '+a);
		},
		
		'string': function(a) {
			alert('Here is string '+a);
		},
		
		'int,string': function(a, b) {
			alert('Here is an int '+a+' and a string '+b);
		},
		'default': function(obj) {
			alert('Here is some other value '+ obj);
		}
		
	});
		
	var u = ivar.setUniqueObject().__uid__;
	ivar.echo(u);
	ivar.echo(window[u]);
	ivar.echo(ivar.uid());
	ivar.echo(st);
	ivar.echo(st.find(['omgzlol','omfg','lol']));
	ivar.namespace('ivar.lol.omg');
	ivar.lol.omg.zomg = 'yes!';
	ivar.echo(ivar.lol.omg.zomg);
	var h = ivar.html.create('h1');
	h.innerHTML = 'lol!';
	var b = document.body;
	b.appendChild(h);
	
	function    Lol  () {
		this.test = '2';
	}
	
	Lol.method(function rofl(){return 'lolzors'});
	
	function Rofl() {
	
	};
	
	function Animal() {
		this.genitals = true;
	};
	
	Animal.method(function say(){
		ivar.echo(this.says);
	});
	
	function Horse() {
		this.says = 'njiii';
		this.legs = 4;
	};
	
	Horse.inherit(Animal);
	
	function Bird() {
		this.says = 'ciuciu';
		this.legs = 2;
		this.wings = 2;
	};
	
	Bird.inherit(Animal);
	
	function Pegasus() {
		this.explodes = true;
	};
	
	Pegasus.inherit(Bird, Horse);
	
	var p = new Pegasus();
	
	ivar.echo(p);
	p.say();
	
	Rofl.inherit(Lol);
	var a = new Rofl();
	for(var i in a)
		ivar.echo(i);
	var lol = new Lol();
	ivar.echo(lol);
	//ivar.echo(lol.rofl());
	
	var g = new ivar.data.Graph();
	g.addNode('a');
	g.addNode('b');
	g.link({label: 'knows', distance: 26 },'a','b');
	g.link({label: 'knows', distance: 0 },'a');
	ivar.echo(g);
}

ivar.ready(test);
ivar.ready(asd);
