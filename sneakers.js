'use strict';

var sneakers =
{	
	// ------------------------------------------
	//
	// Settings. Not all of the defaults follow
	// the film, and when they don't I state
	// what to set.
	//
	// ------------------------------------------

	/*
	* Name of the element's id that the animation will take place.
	*/
	id: "sneakers",
	
	/*
	* Set to true if you're using the animation on a <pre> or an element that has
	* white-space:pre-wrap or white-space:pre.
	*/
	preformatted: false,
	
	/*
	* Rotation is the stage before revealing (decrypting) a character.
	* This var sets for how long will it rotate till it starts decrypting
	* characters, in milliseconds. Set to false and it'll never start,
	* unless you do it externally, on the object itself.
	*/
	rotating_time: 2400,
	
	/*
	* In preformatted mode, you also need to set tab size. Tabs are converted to spaces since
	* that's the only way to rotate them. If prefromated is false, this option is ignored.
	*/
	tab_size: 5,
	
	/*
	* If you set this to a number the algorithm will wait this long in
	* milliseconds and then activate a listener so when you move your mouse
	* or press a key the decryption will start. This can make it a more
	* immersive experience. I can be used together with 'rotating_time':
	* so if the user doesn't give any input the decryption will start after
	* some time.
	*/
	trigger_after: false,
	
	/* 
	* Will slow down rotations. This is before decryption starts. You
	* can slow down rotations during decryption with d_slower. You should
	* set this to 0 to be faithful to the film.
	*/
	r_slower: 0,

	/*
	* In milliseconds, how long is the pause between character swaps. 33-39
	* is close to the film. Values larger than 49 will look unsmooth. You
	* can also use a one dimentional array and the algorithm will pick a
	* random value, but I saw no (visual) benefit from that.
	*/
	//delay: [ 33, 36, 39, 43, 46, 49 ],
	delay: 36,

	/*
	* If true it will not rotate (and thus decrypt) spaces. This will look
	* bad on <pre> if there is leading spaces (for indenting purposes) but
	* not no spaces at the end of the lines to "fill" them. It will look
	* good on non <pre> text. Set true to be faithful to the film.
	*/
	rotate_spaces: false,

	/*
	* Decryption rate. It's not an absolute number, it contibures to the
	* ratio 'letter_id/d_rate'. Smaller d_rate means faster decryption and
	* 0 means instant decryption.
	*/
	d_rate: 90,

	/*
	* During decryption there are still encrypted characters rotating,
	* with this you can control how fast they rotate. Larger number means
	* less rotations. 0.8 is close to the film.
	*/
	d_slower: 0,

	/*
	* The available characters for rotations. Order doesn't matter, we pick
	* them randomly. I could make an array but splitting a big string seems
	* simpler overall. The film seems to use the whole Code page 437, which
	* is provided commented out.
	*/
	chars: "`1234567890-=qwertyuiop[]\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>? ".split(""),
	// chars: "☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓↓→←∟↔▲▼!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■".split(""),
	
	// ------------------------------------------
	//
	// Global variables you're not supposed to
	// teak.
	//
	// ------------------------------------------

	/*
	* When false the whole process will stop, either in the rotation
	* or the decryption phase.
	*/
	running: true,

	/*
	* When set to true decryption starts.
	*/
	decrypt: false,

	/*
	* Keeps track of the unique id we give to spans for letters. Needs to be zero.
	* at the start of the program.
	*/
	letter_id: 0,

	/*
	* Stores all the characters and their span ids, that are located in
	* the id we target (by default #sneakers) that we'll be rotating and
	* decypting. Allows us to track down what characters we have decrypted
	* and keep swaping the rest. Gets created by make_index(). New lines
	* are not included and 'rotate_spaces' will control whether spaces will
	* be included. Needs to be empty at the start of the algorithm.
	*/
	c_index: [],

	// ------------------------------------------
	//
	// functions
	//
	// ------------------------------------------

	/*
	===================
	start
	
	It'll start the process.
	===================
	*/

	start: async function()
	{
		const timer = ms => new Promise(res => setTimeout(res, ms))
				
		var text,i,this_object;
		
		text = document.getElementById(this.id);
		
		if (text == null)
		{
			console.error("The id '" + this.id + "' doesn't exist. Exiting.");
			return 1;
		}
	
		this.recurse_elements(text);
		this.make_index();
		this.loop();

		if (typeof this.trigger_after == 'number')
		{
			await timer(this.trigger_after);

			/*
			* 'this.decrypt' inside the addEventListeners wont work because they act on
			* 'window'. This is a little hack to counter it.
			*/
			this_object = this;
		
			/*
			* Any action from the mouse or keyboard will trigger decryption.
			*/
			window.addEventListener('mousemove', function() { this_object.decrypt = true; });
			window.addEventListener('scroll',    function() { this_object.decrypt = true; });
			window.onkeydown = function() { this_object.decrypt = true; };
		}

		if (typeof this.rotating_time == 'number')
		{
			await timer(this.rotating_time);
			this.decrypt = true;
		}
	},
	
	/*
	===================
	key_press

	Handles key presses. Does the appropriate functions. Used during development to pause the animation or force decryption. To use it you need to disable the window triggers in start() and add this outside of the object: window.onkeydown = function(key) { sneakers.key_press(key); };.
	===================
	*/

	key_press: function(key)
	{
		if (key.which == 115) // the key F4
		{
			if (this.running == true)
			{
				this.running = false;
				console.log("F4: pause");
			}
			else
			if (this.running == false)
			{
				this.running = true;
				this.loop();
				console.log("F4: resume");
			}
		}
		
		if (key.which == 119)
		{
			this.decrypt = true;
			console.log("F8: decrypt");
		}
	},
	
	/*
	===================
	make_index

	Populates c_index[] with the characters we'll be rotating and their span ids.
	===================
	*/

	make_index: function()
	{
		var i,letter;
		
		for (i=0; i<this.letter_id; i++)
		{
			letter = document.getElementById(this.id + '_' + i).textContent;
			this.c_index.push([ i, letter ]);
		}
	},

	/*
	===================
	recurse_elements

	Give it an element (tag) id and it'll will go through all nested elements recursively and add spans (with ids) to each letter. Uses replacer().
	===================
	*/

	recurse_elements: function(element)
	{	
		var i;

		if (element.children.length > 0) // it has nested elements
		{
			for (i=0; i<element.children.length; i++)
			{
				if (element.children[i].children.length > 0)
				{
					this.recurse_elements(element.children[i]); // more nested elements, lets recurse
				}
				else
				{
					element.children[i].innerHTML = this.replacer(element.children[i].innerHTML);
				}
			}
		}
		else
		{
			element.innerHTML = this.replacer(element.innerHTML);		
		}
	},

	/*
	===================
	replacer
	
	Given a word it encloses its letters in span elements and adds an unique id in each one (tracked by letter_id). Use the global 'rotate_spaces' to control wheather spaces will have an id (and therefore be rotated and then decrypted). Use 'preformatted' to set the type of input we have. In preformatted mode, 'tab_size' sets how many spaces each tab will be converted to (the only way to rotate them).
	===================
	*/

	replacer: function(input)
	{
		var i,j,n="",words,spaces;

		/*
		* Don't feel so good that a lot of the code is repeated but the only alternative
		* I can think of is vastly more complicated.
		*/
		if (this.preformatted == false) // non-preformatted
		{
			words = input.split(" ");
			for (i=0; i<words.length; i++)
			{
				n = n + '<span class="word">';

				for (j=0; j<words[i].length; j++)
				{
					switch (words[i][j])
					{					
						// with this we ignore new lines and tabs
						case '\n':
						case '\t':
						break;

						default:
							n = n + '<span id="' + this.id + '_' + this.letter_id + '">' + words[i][j] + '</span>';
							this.letter_id++;
						break;
					}
				}

				n = n + '</span>';
				
				/*
				* So that it wont put a space at the end.
				*/
				
				if (i < words.length-1)
				{
					if (this.rotate_spaces == false)
					{
						n = n + ' '; // no reason to put a span, so lets save some DOM overhead
					}
					else
					if (this.rotate_spaces == true)
					{
						n = n + '<span id="' + this.id + '_' + this.letter_id + '"> </span>';
						this.letter_id++;
					}
				}
			}
		}
		else
		if (this.preformatted == true) // preformatted
		{
			for (i=0; i<input.length; i++)
			{
				switch (input[i])
				{					
					case '\n':
						n = n + '<br />';
					break;
					
					// I got a feeling there is a better way but can't some up with any.
					case '\t':
					case ' ':
						if (input[i] == '\t')
							spaces = this.tab_size;
						else
							spaces = 1;
							
						for (j=0; j<spaces; j++)
						{
							if (this.rotate_spaces == false)
							{
								n = n + " "; // no reason to put a span, so lets save some DOM overhead
							}
							else
							if (this.rotate_spaces == true)
							{
								n = n + '<span id="' + this.id + '_' + this.letter_id + '"> </span>';
								this.letter_id++;
							}
						}
					break;

					default:
						n = n + '<span id="' + this.id + '_' + this.letter_id + '">' + input[i] + '</span>';
						this.letter_id++;
					break;
				}
			}
		}

		return n;
	},

	/*
	===================
	loop

	The main function. Does the rotation (before decryption and during) and the decryption. Decryption is controled by the global 'decrypt'.
	===================
	*/

	loop: async function()
	{
		const timer = ms => new Promise(res => setTimeout(res, ms))

		var i,j,n,random1,random2,shuffled,temp,pack,element;

		pack = this.letter_id / this.d_rate;

		while (this.c_index.length > 0 && this.running == true)
		{
			/*
			* If decryption has been enabled, decrypt a number of characters (the number
			* depends on d_rate)...
			*/

			if (this.decrypt == true)
			{
				for (i=0; i<pack; i++)
				{
					/*
					* The last iteration in this 'for' takes place while there aren't
					* anymore items in c_index[], and with this condition we ensure
					* that this doesn't happen.
					*/
					if (this.c_index.length > 0)
					{
						random1 = Math.floor(Math.random() * this.c_index.length);
						element = document.getElementById(this.id + '_' + this.c_index[random1][0]);

						element.innerHTML = this.c_index[random1][1];
						element.classList.add("decrypted");

						this.c_index.splice(random1,1);
					}
				}
			}

			/*
			* ...and then rotare the remaining encrypted characters.
			*/

			/*
			* Create a shuffled version of c_index[].
			*/
			
			shuffled = this.c_index;
			for (i=0; i<shuffled.length; i++)
			{
				temp = shuffled[i];
				random1 = Math.floor(Math.random() * shuffled.length);
				shuffled[i] = shuffled[random1];
				shuffled[random1] = temp;
			}

			/*
			* Do the rotations.
			*/
			
			for (i=0; i<shuffled.length; i++)
			{
				random1 = Math.random();
				
				/*
				* Before decryption we can slow down rotations with r_slower.
				* During decryption we can do the same with d_slower.
				*/
				if ((this.decrypt == false && random1 > this.r_slower) || (this.decrypt == true && random1 > this.d_slower))
				{
					random2 = Math.floor(Math.random() * this.chars.length);
					document.getElementById(this.id + '_' + shuffled[i][0]).innerHTML = this.chars[random2];
				}
			}

			/*
			* Lets wait till the next operation.
			*/

			if (typeof this.delay == 'number')
				await timer(this.delay);
			else
			if (typeof this.delay == 'object')
				await timer(this.delay[ Math.round(Math.random() * this.delay.length) ])
		}
	},
}

