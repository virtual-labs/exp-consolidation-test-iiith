'use strict';

document.addEventListener('DOMContentLoaded', function(){

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

	function cutting()
	{
		if(translate[1] < 0 && objs['rammer'].pos[1] <= 0)
		{
			translate[1] *= -1;
		}

		updatePos(objs['rammer'], translate);
		const currSoil = objs['soil'].move(step, translate), reqHeight = (objs['collar'].height + objs['mould'].height - 40) / 3;

		if(objs['rammer'].pos[1] + objs['rammer'].height >= currSoil.pos[1] + currSoil.errMargin)
		{
			currSoil.cut(reqHeight, hitLim - hitCtr);
			hitCtr += 1;

			if(hitCtr === hitLim)
			{
				translate[1] = 0;
				cutStep = false;
				step += 1;
				hitCtr = 0;
				objs['rammer'].pos[1] = 90;
				return;
			}

			translate[1] *= -1;
		}
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
				document.getElementById("output1").innerHTML = "Mass of mould = " + String(randomNumber(3500, 3800)) + " g";
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

	function rotate(objs, rotation, rotLim)
	{
		objs.forEach((obj, ix) => {
			if(obj.angle !== rotLim)
			{
				obj.angle += rotation;
				return 0;
			}
		});

		return 1;
	};

	class soil {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.color = "#654321";
			this.normal = 20;
			this.errMargin = 100;
		};

		draw(ctx) {
			ctx.beginPath();
			ctx.fillStyle = this.color;
			ctx.rect(this.pos[0], this.pos[1] + this.height - this.normal, this.width, this.normal);
			ctx.moveTo(this.pos[0], this.pos[1] + this.height - this.normal);
			ctx.quadraticCurveTo(this.pos[0] + this.width / 2, this.pos[1], this.pos[0] + this.width, this.pos[1] + this.height - this.normal);
			ctx.closePath();
			ctx.fill();
		};

		cut(reqHeight, hitsLeft) {
			this.pos[1] += Math.abs(reqHeight - this.height) / hitsLeft;
			this.height -= Math.abs(reqHeight - this.height) / hitsLeft;
			this.normal += Math.abs(reqHeight - this.normal) / hitsLeft;
			this.errMargin -= this.errMargin / hitsLeft;
		};
	};
	
	class soils {
		constructor(num, currSoil) {
			this.height = currSoil.height;
			this.width = currSoil.width;
			this.pos = [...currSoil.pos];
			this.soils = [];
			
			for(let i = 0; i < num; i += 1)
			{
				this.soils.push(new soil(this.height, this.width, this.pos[0], this.pos[1]));
				this.soils[i].color = currSoil.color;
			}
		};

		draw(ctx) {
			this.soils.forEach((soil, idx) => {
				soil.draw(ctx);
			});
		};

		move(step, translate) {
			if(step === 9 || step === 10)
			{
				return this.soils[0];
			}
			else if(step === 11 || step === 12)
			{
				return this.soils[1];
			}
			else if(step === 13 || step === 14)
			{
				return this.soils[2];
			}
			else
			{
				this.soils.forEach((soil, ix) => {
					updatePos(soil, translate);
				});
				return this;
			}
		};

		trim(change) {
			this.soils.pop();
			this.soils[this.soils.length - 1].pos[1] += change;
			return 1;
		}
	};

	class mould {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/mould.png';
			this.img.onload = () => {ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);}; 
		};

		draw(ctx) {
			ctx.drawImage(objs['mould'].img, objs['mould'].pos[0], objs['mould'].pos[1], objs['mould'].width, objs['mould'].height);
		};
	};

	class water {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.angle = 0;
			this.waterHeight = height / 2;
			this.flowPercent = [0, 0];
			this.flowDims = [height / 6, 180];
			this.waterStart = [this.waterHeight, -width / 2];
			this.flowFlag = false;
		};

		draw(ctx) {
			ctx.lineWidth = 3;
			ctx.translate(this.pos[0] + this.width / 2, this.pos[1] + this.height / 2);
			ctx.rotate(this.angle * Math.PI / 180);

			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height)
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			const e1 = [this.width / 2, -this.height / 2], e2 = [-this.width / 2, -this.height / 2];
			const gradX = (e1[0] - e2[0]) / -4, gradY = 5;

			ctx.fillStyle = "white";
			ctx.beginPath();
			ctx.moveTo(e2[0], e2[1]);
			curvedArea(ctx, e2, -1 * gradX, -1 * gradY);
			curvedArea(ctx, e1, gradX, gradY);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			ctx.fillStyle = "#1ca3ec";
			ctx.beginPath();
			ctx.rect(-this.width / 2 + 2, this.height / 2 - this.waterHeight, this.width - 4, this.waterHeight - 2);
			ctx.rect(-this.width / 2 + 2, this.height / 2 - this.waterStart[0], this.flowDims[0], -this.flowPercent[0] * (this.height - this.waterStart[0]));
			ctx.rect(this.waterStart[1] + 2 + this.flowDims[0], -this.height / 2 - this.flowDims[0], -this.flowPercent[1] * this.flowDims[1], this.flowDims[0]);
			ctx.closePath();
			ctx.fill();

			ctx.setTransform(1, 0, 0, 1, 0, 0);
		};

		flow(change) {
			if(this.flowPercent[0] < 1)
			{
				this.flowPercent[0] += change;
			}
			else if(this.flowPercent[1] < 1 && !this.flowFlag)
			{
				this.flowPercent[1] += change;
			}
			else if(this.waterHeight > 1)
			{
				this.flowFlag = true;
				this.waterHeight *= (1 - change);
				this.waterStart[0] *= (1 - change);
			}
			else if(this.waterStart[0] < this.height)
			{
				this.waterStart[0] += change * this.height;
			}
			else if(this.waterStart[1] > -this.width / 2 - this.flowDims[1])
			{
				this.waterStart[1] -= change * this.flowDims[1];
				this.flowPercent[1] -= change;
			}
			else
			{
				return 1;
			}

			return 0;
		};
	};

	class collar {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/collar.png';
			this.img.onload = () => {ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);}; 
		};

		draw(ctx) {
			ctx.drawImage(objs['collar'].img, objs['collar'].pos[0], objs['collar'].pos[1], objs['collar'].width, objs['collar'].height);
		};
	};

	class rammer {
		constructor(height, width, x, y) {
			this.height = height;
			this.width = width;
			this.pos = [x, y];
			this.img = new Image();
			this.img.src = './images/rammer.png';
			this.img.onload = () => {ctx.drawImage(this.img, this.pos[0], this.pos[1], this.width, this.height);}; 
		};

		draw(ctx) {
			ctx.drawImage(objs['rammer'].img, objs['rammer'].pos[0], objs['rammer'].pos[1], objs['rammer'].width, objs['rammer'].height);
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
		cutStep = false;
		hitCtr = 0;

		document.getElementById("output1").innerHTML = "Mass of mould = ____ g";
		document.getElementById("output2").innerHTML = "Volume of soil = ____ cm" + "3".sup();

		objs = {
			"weight": new weight(270, 240, 90, 190),
			"mould": new mould(120, 180, 570, 270),
			"collar": new collar(70, 130, 595, 220),
			"rammer": new rammer(60, 50, 635, 90),
			"water": new water(70, 60, 155, 60),
			"soil": new soil(210, 110, 90, 170),
		};
		keys = [];

		enabled = [["weight"], ["weight", "mould"], ["weight", "mould"], ["weight", "mould"], ["weight", "mould", "soil"], ["mould", "soil", "water"], ["mould", "soil", "water"], ["mould", "soil", "collar"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil", "collar", "rammer"], ["mould", "soil"], ["weight", "mould", "soil"], ["weight", "mould", "soil"], []];
		step = 0;
		translate = [0, 0];
		lim = [-1, -1];
		rotation = 0;
		rotLim = -1;
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
				if((step === 2 || step === 17) && val === "mould")
				{
					hover = true;
					translate[0] = -5;
					translate[1] = -5;
					lim[0] = 120;
					lim[1] = 150;
				}

				else if(step === 3 && val === "mould")
				{
					hover = true;
					translate[0] = 5;
					translate[1] = 5;
					lim[0] = 570;
					lim[1] = 270;

					if(flag)
					{
						keys = keys.filter(function(val, index) {
							return val !== "weight";
						});
					}
				}

				else if(step === 6 && val === "water")
				{
					hover = true;
					rotation = -1;
					rotLim = -90;
				}

				else if(step === 9 && val === "soil")
				{
					hover = true;
					const temp = new soils(3, objs['soil']);
					objs['soil'] = temp;

					translate[0] = 5;
					translate[1] = -1;
					lim[0] = 605;
					lim[1] = 160;
				}

				else if((step === 10 || step === 12 || step === 14) && val === "rammer")
				{
					hover = true;
					cutStep = true;
					translate[1] = 5;
				}

				else if(step === 11 && val === "soil")
				{
					hover = true;
					translate[0] = 5;
					translate[1] = -1;
					lim[0] = 605;
					lim[1] = 110;
				}

				else if(step === 13 && val === "soil")
				{
					hover = true;
					translate[0] = 5;
					translate[1] = -1;
					lim[0] = 605;
					lim[1] = 60;
				}

				else if(step === 15 && val === "mould")
				{
					hover = true;
					if(flag)
					{
						keys = keys.filter(function(val, index) {
							return val !== "collar" && val !== "rammer";
						});
						translate[1] = 10;
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
			rotation = 0;
			rotLim = -1;
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

	const fill = "#A9A9A9", border = "black", lineWidth = 1.5, fps = 150;
	const msgs = [
		"Click on 'Weighing Machine' in the apparatus menu to add a weighing machine to the workspace.", 
		"Click on 'Mould' in the apparatus menu to add a mould to the workspace.",
		"Click on the mould to move it to the weighing machine and weigh it.",
		"Click on the mould to move it back away from the weighing machine to make space for other apparatus.",
		"Click on 'Soil Sample' in the apparatus menu to add a soil sample to the workspace.",
		"Click on 'Water' in the apparatus menu to add a container of water to the workspace.",
		"Click on the water container to pour it onto the soil.",
		"Click on 'Collar' in the apparatus menu to add a collar to the workspace.",
		"Click on 'Rammer' in the apparatus menu to add a rammer to the workspace.",
		"Click on the soil to move a portion of it to the mould for compaction.",
		"Click on the rammer to compact the soil by repeated strikes.",
		"Click on the soil to move a portion of it to the mould for compaction.",
		"Click on the rammer to compact the soil by repeated strikes.",
		"Click on the soil to move a portion of it to the mould for compaction.",
		"Click on the rammer to compact the soil by repeated strikes.",
		"Click on the mould with soil to remove the collar and trim the excess soil.",
		"Click on 'Weighing Machine' in the apparatus menu to add a weighing machine to the workspace.", 
		"Click on the mould with soil to weigh it. Finally, determine the water content of the soil sample. Use the following <a href='https://sd-iiith.vlabs.ac.in/exp/water-content/'>link</a> to learn more about water content determination.",
		"Click the restart button to perform the experiment again.",
	];

	const hitLim = 10;
	let soilVol;
	let step, translate, rotation, lim, rotLim, objs, keys, enabled, small, cutStep, hitCtr;
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
			if(elem === "soil")
			{
				soilVol = randomNumber(940, 950);
				document.getElementById("output2").innerHTML = "Volume of soil = " + String(soilVol) + "cm" + "3".sup();
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

		if(ctr === enabled[step].length && !rotation &&!translate[0] && !translate[1])
		{
			document.getElementById("main").style.pointerEvents = 'auto';
		}

		if(step === 6 && rotation && rotate([objs['water']], rotation, rotLim))
		{
			if(objs['water'].flow(0.01))
			{
				objs['soil'].color = "#b86d29";
				keys = keys.filter(function(val, index) {
					return val !== "water";
				});

				rotation = 0;
				rotLim = -1;
				step += 1;
			}
		}

		if(translate[0] !== 0 || translate[1] !== 0)
		{
			let temp = step;
			const soilMoves = [9, 11, 13, 17], mouldMoves = [2, 3, 17];

			if(step === 15)
			{
				temp += objs['soil'].trim(translate[1]);
				translate[1] = 0;
			}

			if(soilMoves.includes(step))
			{
				updatePos(objs['soil'].move(step, translate), translate);
				if(step !== 17)
				{
					temp = limCheck(objs['soil'].move(step, translate), translate, lim, step);
				}
			}

			if(mouldMoves.includes(step))
			{
				updatePos(objs['mould'], translate);
				temp = limCheck(objs['mould'], translate, lim, step);
			}

			step = temp;
		}

		if(cutStep)
		{
			cutting();
		}

		document.getElementById("procedure-message").innerHTML = msgs[step];
		tmHandle = window.setTimeout(draw, 1000 / fps);
	};

	let tmHandle = window.setTimeout(draw, 1000 / fps);
});
