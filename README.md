# Sneakers

A JavaScript library to recreate the decryption animation from the 1992 tech thriller [Sneakers](https://en.wikipedia.org/wiki/Sneakers_(1992_film)). You can see the effect in [this](https://youtu.be/F5bAa6gFvLs?t=33) clip, around 33sec.

By default the library will follow the behaviour in that scene but you can tweak all of the parameters for the animation.

The animation takes place in two stages: rotation and decryption. In the first stage all the characters rotate randomly. In the decryption stage the characters gradually get revealed, while some characters still rotate, waiting for their turn, until they all eventually get revealed. You can modify this default behaviour and have only one part of the animation play.

Before we see how to use the library, some demos!

- [demo1](demo1.html) - an imitation of the scene in the film
- [demo2](demo2.html) - decryption without delay (the scene involves delay in decryption)
- [demo3](demo3.html) - source code, and rotation including spaces
- [demo4](demo4.html) - rotating without ever decrypting, and have not all element rotate at the same time

## How to use the library

Include `sneakers.js` and `sneakers.css` into your project.

The name of the object is `sneakers` and you're free to change that. By default the object will work on the element with id `sneakers` but you can change that with `sneakers.id = "myelement"`. Unfortunately, you can only apply the effect on one element but I plan to allow classes in a future version.

In order to achieve the animation I wrap each character in a `span` which has a unique `id`. ids are created by `sneakers.id` plus an incrementing number. The default `sneakers.id` is `sneakers`, so the first id is `sneakers_1`, the second is `sneakers_2` and so on. Make sure that there are no other such ids in the DOM.

The CSS file is necessary as it sets the word-wrapping styles and sets the font to monospace. It doesn't contain any color or layout styling. You'll need to provide your own CSS for asthetics. The most important is the three CSS vars `--sneakers-bg` for the background color, `--sneakers-rotating` for the color of the text while it rotates, and `--sneakers-decrypted` for the color of the text once it's been decrypted. The third var is optional.

You can use the animation in an element that uses preformatted (like `<pre` or anything that uses `white-space` with `pre` or `pre-wrap`) or normal wrapping. In the first case you need to set `sneakers.preformatted = true` otherwise wrapping will break badly. If you use preformatted, make sure the lines don't exceed the max width of the element. Wrapping is going to work but the animation will look bad as the browser tries to wrap the long line in various symbols (like `/` or `'`) so the line will constantly change wrapping.

If you want to use the animation on source code, then don't use `<pre>`, it'll will mess up the wrapping. It's `<ul>` that you want. To see that in action, check [demo3](demo3.html). `<pre>` is better suited for ASCII art.

You can set the object so that only one of the two animations play out. To have only rotationset `sneakers.only_rotate = false`, and to have only the decryption part play out, set `sneakers.rotating_time = 0`.

## Parameters

`id` - Name of the element's id that the animation will take place.

`preformatted` - Set to `true` if you're using the animation on a `<pre>` or an element that has `white-space: pre-wrap` or `white-space: pre`.

`rotating_time` - How long (in milliseconds) will the rotation stage last. Set this to `false` and rotation will never stop, and decryption will never start.

`tab_size` - Tabs are converted to spaces since it's the only way to rotate them. This var controls how many spaces will a tab be converted to. This is only used when `preformatted` is used, otherwise it's ignored.

`trigger_after` - If you set this to a number then the algorithm will wait this long (in milliseconds) and then activate a listener for mouse or keyboard activity. When the listener triggers (when the user uses the keyboard or mouse) decryption will start. This makes the effect more engaging.

`r_slower` - During rotation, by default, all characters inside the target element rotate. If there are more than 1000 characters (and in older computers and phones it could be as low as 300) this can cause a load on the CPU. With this var you can alleviate that. It'll make some of the characters rotate, not all. It also has a different visual effect that you may prefer. It's a float in the range 0-1.

`delay` - For how long to wait (in milliseconds) between a letter rotation and the next. Setting this too low will put a serious load on the CPU because by default during rotation all characters inside the element are rotated. The load can be alleviated with `r_slower`. Something that's above 49ms will look really bad. Optimal is 30-39ms.

`rotate_spaces` - Whether spaces will get rotated along with the rest of the characters.

`d_rate` - The smaller this number the faster decryption will take place. During decryption some characters get revealed while others continue to rotate. This controls how many characters gets revealed per second. It's not an absolute number though. It's an integer and you can set it from 0 to however large you want. Practically, something that's above 9999 won't make any difference.

`d_slower` - Like `r_slower` but during decryption. Controls how fast will the characters rotate during decryption. Float in the range 0-1, with 0 being the fastest.

`chars` - The range of characters that will be used for rotations. The library by default uses the 96 characters you can produce with the keyboard. The film uses the whole Code page 437. The variable is an array of characters. I found it more convenient to use a string and then .split(""). I recommend you do the same.

## Notes

To achieve the animation I enclose every letter in a span. 1000 characters means 1000 spans all changing every 30ms. This puts a lot of strain on browsers, tools that were never meant to do such a task. Thus, sometimes the animation slows down or even pauses for a glimpse of a second. You can play with `r_slower` or `delay` but that will only improve up to a point, the problem won't go away.

The intro animation from Ghost In The Shell (1995) does something similar to Sneakers (1992) but there are some key differences, like when decryption takes place the decrypted letters move as characters vanish and reappear. So a faithful representation of the GITS effect using this library is impossible. But you can try extending it!

[nms](https://github.com/bartobri/no-more-secrets) is a program that does what this library do, but on the Linux console. I didn't lift any of the methods used there but it was what triggered me to make this library. It's a really cool project, check it out.

The first demo uses IBM Nouveu by Arto Hatanpää, which is the font that most closely resembles the font we see on the movie - a PC from the late 80s or early 90s.

