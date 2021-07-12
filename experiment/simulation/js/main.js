'use strict';

document.addEventListener('DOMContentLoaded', function() {

	const restartButton = document.getElementById('restart');
	const instrMsg = document.getElementById('procedure-message');

	restartButton.addEventListener('click', function() {restart();});

	function randomNumber(min, max) {
		return Number((Math.random() * (max - min + 1) + min).toFixed(2));
	};

	function logic(tableData)
	{
		const waterContents = [randomNumber(7, 9), randomNumber(10, 12), randomNumber(12, 14), randomNumber(15, 16), randomNumber(17, 18)], soilMasses = [randomNumber(1500, 1600), randomNumber(1750, 1800), randomNumber(2150, 2200), randomNumber(2100, 2150), randomNumber(2000, 2150),];
		let xVals = [], yVals = [], maxIx = 0;
		tableData.forEach(function(row, index) {
			row['Soil Sample No.'] = index + 1;
			row['Water Content(%)'] = Number(waterContents[index]);
			row['Wet Compacted Soil Mass(g)'] = Number(soilMasses[index]);
			row['Wet Density(g/cc)'] = (soilMasses[index] / soilVol).toFixed(2);
			row['Dry Density(g/cc)'] = Number((row['Wet Density(g/cc)'] / (1 + waterContents[index] / 100)).toFixed(2));
			xVals.push(row['Water Content(%)']);
			yVals.push(row['Dry Density(g/cc)']);

			if(yVals[maxIx] < yVals[index])
			{
				maxIx = index;
			}
		});

		document.getElementById('optWater').innerHTML = "Optimum Moisture Content = " + String(xVals[maxIx]) + " %";
		document.getElementById('maxDensity').innerHTML = "Maximum Dry Density = " + String(yVals[maxIx]) + " g/cm<sup>3</sup>";
		return trace(xVals, yVals, 'Graph');
	};

	function limCheck(obj, translate, lim, step)
	{
		if(obj.pos[0] === lim[0])
		{
			translate[0] = 0;
		}

		if(obj.pos[1] === lim[1])
		{
			translate[1] = 0;
		}

		if(translate[0] === 0 && translate[1] === 0)
		{
			if(step === 2)
			{
				document.getElementById("output1").innerHTML = "Mass of ring = " + String(randomNumber(3500, 3800)) + " g";
			}

			else if(step === 4)
			{
				objs['soil'] = new ring(obj.height, obj.width, obj.pos[0], obj.pos[1], obj.color);
			}

			else if(step === enabled.length - 2)
			{
				const retTrace = logic(tableData);
				generateTableHead(table, Object.keys(tableData[0]));
				generateTable(table, tableData);
				drawGraph([retTrace], ['Water Content(%)', 'Dry Density(g/cc)'], 'plot');

				document.getElementById("main").style.display = 'none';
				document.getElementById("graph").style.display = 'inline-block';

				document.getElementById("apparatus").style.display = 'none';
				document.getElementById("observations").style.width = '40%';
				if(small)
				{
					document.getElementById("observations").style.width = '85%';
				}
			}
			return step + 1;
		}

		return step;
	};

	function updatePos(obj, translate)
	{
		obj.pos[0] += translate[0];
		obj.pos[1] += translate[1];
	};

	function canvas_arrow(ctx, fromx, fromy, tox, toy) {
		const headlen = 10, dx = tox - fromx, dy = toy - fromy, angle = Math.atan2(dy, dx);
		ctx.moveTo(fromx, fromy);
		ctx.lineTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
		ctx.moveTo(tox, toy);
		ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
	};

	class loader {
		constructor(height, width, radius, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.marginHoriz = 0.3 * this.height;
			this.radius = radius;
			this.angle = 0;
		};

		draw(ctx) {
			const marginVert = 0.1 * this.width, heightVert = 0.85 * this.height, widthVert = 0.05 * this.width, heightHoriz = 0.1 * this.height;
			ctx.fillStyle = data.colors.gray;

			ctx.beginPath();
			ctx.rect(this.pos[0] + marginVert, this.pos[1], widthVert, heightVert);
			ctx.rect(this.pos[0] + this.width - marginVert, this.pos[1], -widthVert, heightVert);
			ctx.rect(this.pos[0], this.pos[1] + heightVert, this.width, this.height - heightVert);
			ctx.rect(this.pos[0], this.pos[1] + heightVert, this.width, this.height - heightVert);
			ctx.rect(this.pos[0], this.pos[1] + this.marginHoriz, this.width, heightHoriz);
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.arc(this.pos[0] + this.width / 2, this.pos[1] + this.radius, this.radius, 0, 2 * Math.PI);

			canvas_arrow(ctx, this.pos[0] + this.width / 2, this.pos[1] + this.radius, this.pos[0] + this.width / 2 + this.radius * Math.sin(this.angle), this.pos[1] + this.radius * (1 - Math.cos(this.angle)));
			//ctx.moveTo(this.pos[0] + this.width / 2, this.pos[1] + this.radius);
			//ctx.lineTo(this.pos[0] + this.width / 2 + this.radius * Math.sin(this.angle), this.pos[1] + this.radius * (1 - Math.cos(this.angle)));

			ctx.moveTo(this.pos[0] + this.width / 2, this.pos[1] + 2 * this.radius);
			ctx.lineTo(this.pos[0] + this.width / 2, this.pos[1] + this.marginHoriz);
			ctx.fill();
			ctx.stroke();
		};

		applyLoad(change) {
			this.marginHoriz += change;
			this.angle += 5 * change * Math.PI / 180;
		};
	};

	class loadingCap {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
		};

		draw(ctx) {
			ctx.fillStyle = data.colors.gray;
			const gradX = 30, gradY = 20;

			ctx.beginPath();
			ctx.moveTo(this.pos[0], this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + gradY);
			ctx.lineTo(this.pos[0] + this.width - gradX, this.pos[1]);
			ctx.lineTo(this.pos[0] + gradX, this.pos[1]);
			ctx.lineTo(this.pos[0], this.pos[1] + gradY);
			ctx.lineTo(this.pos[0], this.pos[1] + this.height);
			ctx.fill();
			ctx.stroke();
		};

		fill(change) {
			if(this.waterHeight >= this.height - 10)
			{
				return 1;
			}

			this.waterHeight += change;
			return 0;
		};
	};

	class waterBath {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.waterHeight = 0;
		};

		draw(ctx) {
			ctx.fillStyle = data.colors.blue;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1] + (this.height - this.waterHeight), this.width, this.waterHeight);
			ctx.closePath();
			ctx.fill();

			ctx.beginPath();
			ctx.moveTo(this.pos[0], this.pos[1]);
			ctx.lineTo(this.pos[0], this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
			ctx.stroke();
		};

		fill(change) {
			if(this.waterHeight >= this.height - 10)
			{
				return 1;
			}

			this.waterHeight += change;
			return 0;
		};
	};

	class ring {
		constructor(height, width, x, y, color) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.color = color;
		};

		draw(ctx) {
			ctx.fillStyle = this.color;

			const e1 = [this.pos[0] + this.width, this.pos[1]], e2 = [...this.pos];
			const gradX = (e1[0] - e2[0]) / -4, gradY = 5;

			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			curvedArea(ctx, e2, -1 * gradX, -1 * gradY);
			curvedArea(ctx, e1, gradX, gradY);
			ctx.lineTo(this.pos[0], this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1] + this.height);
			ctx.lineTo(this.pos[0] + this.width, this.pos[1]);
			curvedArea(ctx, [this.pos[0] + this.width, this.pos[1]], gradX, gradY);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};
	};

	class rect {
		constructor(height, width, x, y, color) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.color = color; 
		};

		draw(ctx) {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.rect(this.pos[0], this.pos[1], this.width, this.height);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		};

		shrink(change) {
			this.height -= change;
		};
	};

	class stones {
		constructor(height, width, x, y, gap) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.gap = gap;
			
			this.stonesArr = [new rect(this.height, this.width, this.pos[0], this.pos[1], "black"), new rect(this.height, this.width, this.pos[0], this.pos[1] + this.gap, "black")];
		};

		draw(ctx) {
			this.stonesArr.forEach((stone, ind) => {
				stone.draw(ctx);
			});
		};
	};

	class weight {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/weighing-machine.png';
			this.img.onload = () => {ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);}; 
		};

		draw(ctx) {
			ctx.drawImage(objs['weight'].img, objs['weight'].pos[0], objs['weight'].pos[1], objs['weight'].width, objs['weight'].height);
		};
	};

	function lineFromPoints(p, q)
	{
		const m = (q[1] - p[1]) / (q[0] - p[0]), c = p[1] - m * p[0];
		const xVals = math.range(p[0], q[0], 1).toArray();
		const yVals = xVals.map(function (x) {
			return Number((m * x + c).toFixed(2));
		});

		return [xVals, yVals];
	};

	function trace(Xaxis, Yaxis, name)
	{
		let xVals = [], yVals = [];

		Xaxis.forEach(function(xcoord, i) {
			let xTemp, yTemp;
			if(i !== Xaxis.length - 1)
			{
				[xTemp, yTemp] = lineFromPoints([Xaxis[i], Yaxis[i]], [Xaxis[i + 1], Yaxis[i + 1]]);
			}

			xVals = xVals.concat(xTemp);
			yVals = yVals.concat(yTemp);
		});

		const retTrace = {
			x: xVals,
			y: yVals,
			name: name,
			type: 'scatter',
			mode: 'lines',
		};

		return retTrace;
	};

	function drawGraph(traces, text, id) {
		try {
			const layout = {
				width: 400,
				height: 400,
				xaxis: {
					title: {
						text: text[0],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
					range: [0, 20],
					dtick: 5
				},
				yaxis: {
					title: {
						text: text[1],
						font: {
							family: 'Courier New, monospace',
							size: 18,
							color: '#000000'
						}
					},
					range: [1, 2.4],
					dtick: 0.2
				}
			};

			const config = {responsive: true};
			Plotly.newPlot(id, traces, layout, config);
		}

		catch (err) {
			console.error(err);
			alert(err);
		}
	};

	function init()
	{
		fps = 150;
		document.getElementById("output1").innerHTML = "Mass of ring = ____ g";
		document.getElementById("output2").innerHTML = "Volume of soil = ____ cm" + "3".sup();

		objs = {
			"loader": new loader(330, 270, 30, 480, 50),
			"weight": new weight(270, 240, 90, 190),
			"water": new waterBath(110, 170, 530, 215),
			"ring": new ring(50, 150, 600, 330, data.colors.gray),
			"soil": new rect(50, 140, 610, 330, data.colors.soilBrown),
			"stones": new stones(20, 140, 140, 190, 70),
			"loadingCap": new loadingCap(50, 140, 545, 185),
		};
		keys = [];

		enabled = [["weight"], ["weight", "ring"], ["weight", "ring"], ["weight", "ring", "soil"], ["weight", "ring", "soil"], ["ring", "soil", "stones"], ["ring", "soil", "stones", "loader"], ["ring", "soil", "stones", "loader", "water"], ["ring", "soil", "stones", "loader", "water"], ["ring", "soil", "stones", "loader", "water"], ["ring", "soil", "stones", "loader", "water", "loadingCap"], ["ring", "soil", "stones", "loader", "water", "loadingCap"], [], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
	};

	function restart() 
	{ 
		window.clearTimeout(tmHandle); 

		document.getElementById("main").style.display = 'block';
		document.getElementById("graph").style.display = 'none';
		document.getElementById("apparatus").style.display = 'block';
		document.getElementById("observations").style.width = '';

		table.innerHTML = "";
		init();

		tmHandle = window.setTimeout(draw, 1000 / fps); 
	};

	function generateTableHead(table, data) {
		let thead = table.createTHead();
		let row = thead.insertRow();
		data.forEach(function(key, ind) {
			let th = document.createElement("th");
			let text = document.createTextNode(key);
			th.appendChild(text);
			row.appendChild(th);
		});
	};

	function generateTable(table, data) {
		data.forEach(function(rowVals, ind) {
			let row = table.insertRow();
			Object.keys(rowVals).forEach(function(key, i) {
				let cell = row.insertCell();
				let text = document.createTextNode(rowVals[key]);
				cell.appendChild(text);
			});
		});
	};

	function check(event, translate, step, flag=true)
	{ 
		if(translate[0] !== 0 || translate[1] !== 0)
		{
			return step;
		}

		const canvasPos = [(canvas.width / canvas.offsetWidth) * (event.pageX - canvas.offsetLeft), (canvas.height / canvas.offsetHeight) * (event.pageY - canvas.offsetTop)];
		const errMargin = 10;

		let hover = false;
		canvas.style.cursor = "default";
		keys.forEach(function(val, ind, arr) {
			if(canvasPos[0] >= objs[val].pos[0] - errMargin && canvasPos[0] <= objs[val].pos[0] + objs[val].width + errMargin && canvasPos[1] >= objs[val].pos[1] - errMargin && canvasPos[1] <= objs[val].pos[1] + objs[val].height + errMargin)
			{
				if(step === 2 && val === "ring")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 135;
					lim[1] = 210;
				}

				else if(step === 4 && val === "soil")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 140;
					lim[1] = 210;
				}

				else if(step === 8 && val === "soil")
				{
					hover = true;
					translate[0] = 5;
					translate[1] = 5;
					lim[0] = objs['water'].pos[0] + objs['water'].width / 2 - objs['ring'].width / 2;
					lim[1] = objs['water'].pos[1] + objs['water'].height - objs['stones'].height - objs['ring'].height;
				}

				else if(step === 9 && val === "water")
				{
					hover = true;
					translate[1] = 1;
				}

				else if(step === 11 && val === "loadingCap")
				{
					hover = true;
					translate[1] = 1;
					lim[1] = 210;
					if(flag)
					{
						fps = 30;
					}
				}
			}
		});

		if(!flag && hover)
		{
			canvas.style.cursor = "pointer";
			translate[0] = 0;
			translate[1] = 0;
			lim[0] = 0;
			lim[1] = 0;
		}

		return step;
	};

	function curvedArea(ctx, e, gradX, gradY)
	{
		ctx.bezierCurveTo(e[0], e[1] += gradY, e[0] += gradX, e[1] += gradY, e[0] += gradX, e[1]);
		ctx.bezierCurveTo(e[0] += gradX, e[1], e[0] += gradX, e[1] -= gradY, e[0], e[1] -= gradY);
	};

	const canvas = document.getElementById("main");
	canvas.width = 840;
	canvas.height = 400;
	canvas.style = "border:3px solid";
	const ctx = canvas.getContext("2d");
	ctx.lineWidth = 3;

	const border = "black", lineWidth = 3;
	const msgs = [
		"Click on 'Weighing Machine' in the apparatus menu to add a weighing machine to the workspace.", 
		"Click on 'Consolidation Ring' in the apparatus menu to add a consolidation ring to the workspace.",
		"Click on the ring to move it to the weighing machine and weigh it.",
		"Click on 'Soil Sample' in the apparatus menu to add a soil sample to the workspace.",
		"Click on the soil sample to move it to the ring and weigh them together.",
		"Click on 'Porous Stones' in the apparatus menu to add porous stones to the top and bottom of the ring.",
		"Click on 'Loading Device' in the apparatus menu to add a loading device to the workspace.",
		"Click on 'Water Bath' in the apparatus menu to add a water bath to the loading device.",
		"Click on the soil to move it along with the ring and stones to the water bath.",
		"Click on the water bath to fill it with water.",
		"Click on 'Loading Cap' in the apparatus menu to add a loading cap to the setup in the water bath.",
		"Click on the loading cap to apply a load/force on the soil.",
		"Click the restart button to perform the experiment again.",
	];

	let soilVol;
	let step, translate, lim, objs, keys, enabled, small, fps;
	init();

	const tableData = [
		{ "Soil Sample No.": "", "Water Content(%)": "", "Wet Compacted Soil Mass(g)": "", "Wet Density(g/cc)": "", "Dry Density(g/cc)": "" }, 
		{ "Soil Sample No.": "", "Water Content(%)": "", "Wet Compacted Soil Mass(g)": "", "Wet Density(g/cc)": "", "Dry Density(g/cc)": "" }, 
		{ "Soil Sample No.": "", "Water Content(%)": "", "Wet Compacted Soil Mass(g)": "", "Wet Density(g/cc)": "", "Dry Density(g/cc)": "" }, 
		{ "Soil Sample No.": "", "Water Content(%)": "", "Wet Compacted Soil Mass(g)": "", "Wet Density(g/cc)": "", "Dry Density(g/cc)": "" }, 
		{ "Soil Sample No.": "", "Water Content(%)": "", "Wet Compacted Soil Mass(g)": "", "Wet Density(g/cc)": "", "Dry Density(g/cc)": "" }, 
	];

	const objNames = Object.keys(objs);
	objNames.forEach(function(elem, ind) {
		const obj = document.getElementById(elem);
		obj.addEventListener('click', function(event) {
			if(elem === "stones")
			{
				objs['soil'] = new rect(objs['soil'].height, objs['soil'].width, objs['soil'].pos[0], objs['soil'].pos[1], objs['soil'].color);
				objs['ring'] = new rect(objs['ring'].height, objs['ring'].width, objs['ring'].pos[0], objs['ring'].pos[1], objs['ring'].color);
				keys = keys.filter(function(val, index) {
					return val !== "weight";
				});
			}

			keys.push(elem);
			step += 1;
		});
	});

	canvas.addEventListener('mousemove', function(event) {check(event, translate, step, false);});
	canvas.addEventListener('click', function(event) {
		step = check(event, translate, step);
	});

	const table = document.getElementsByClassName("table")[0];

	function responsiveTable(x) {
		if(x.matches)	// If media query matches
		{ 
			small = true;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '85%';
			}
		} 

		else
		{
			small = false;
			if(step === enabled.length - 1)
			{
				document.getElementById("observations").style.width = '40%';
			}
		}
	};

	let x = window.matchMedia("(max-width: 1023px)");
	responsiveTable(x); // Call listener function at run time
	x.addListener(responsiveTable); // Attach listener function on state changes

	function draw()
	{
		ctx.clearRect(0, 0, canvas.width, canvas.height); 
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		let ctr = 0;
		document.getElementById("main").style.pointerEvents = 'none';

		objNames.forEach(function(name, ind) {
			document.getElementById(name).style.pointerEvents = 'auto';
			if(keys.includes(name) || !(enabled[step].includes(name)))
			{
				document.getElementById(name).style.pointerEvents = 'none';
			}

			if(keys.includes(name)) 
			{
				if(enabled[step].includes(name))
				{
					ctr += 1;
				}
				objs[name].draw(ctx);
			}
		});

		if(ctr === enabled[step].length && !translate[0] && !translate[1])
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			const soilMoves = [4, 8, 11], ringMoves = [2, 8], stoneMoves = [8, 11], loadingCapMoves = [11];

			if(step === 9)
			{
				temp += objs['water'].fill(translate[1]);
				if(temp !== step)
				{
					translate[1] = 0;
				}
			}

			if(stoneMoves.includes(step))
			{
				updatePos(objs['stones'], translate);
				updatePos(objs['stones'].stonesArr[0], translate);
				if(!loadingCapMoves.includes(step))
				{
					updatePos(objs['stones'].stonesArr[1], translate);
					if(!ringMoves.includes(step))
					{
						temp = limCheck(objs['stones'], translate, lim, step);
					}
				}
			}

			if(soilMoves.includes(step))
			{
				updatePos(objs['soil'], translate);

				if(loadingCapMoves.includes(step))
				{
					objs['soil'].shrink(translate[1]);
					objs['loader'].applyLoad(translate[1]);
				}

				else if(!ringMoves.includes(step))
				{
					temp = limCheck(objs['soil'], translate, lim, step);
				}
			}

			if(ringMoves.includes(step))
			{
				updatePos(objs['ring'], translate);
				temp = limCheck(objs['ring'], translate, lim, step);
			}

			if(loadingCapMoves.includes(step))
			{
				updatePos(objs['loadingCap'], translate);
				temp = limCheck(objs['loadingCap'], translate, lim, step);
			}

			step = temp;
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
