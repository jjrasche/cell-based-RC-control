// console.log(distance(5,0,0,0));
console.log(distance(5,5,0,0));

function distance(x1, y1, x2, y2) {
	console.log(arguments.callee);
	return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1),2));
};