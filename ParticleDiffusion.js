var INIT_DENSITY = 0.000025; // particles per sq px
var INIT_RADIUS = 10; //PARTICLE_RADIUS_RANGE = [10, 10],
var INIT_MEAN_VELOCITY = 4; //Velocity initially uniformly distributed
var INIT_VELOCITY_MULTIPLIER = 1;
var INIT_INFECTIOUS = 1;

var density = 0;
var radius = 0;
var meanVelocity = 0;
var velocityMultiplier = 0;

var nbrSusceptible = 0;
var nbrExposed = 0;
var nbrInfectious = 0;
var nbrRecovered = 0;
var nbrExpired = 0;

var colorSusceptible = "#3F51B5";
var colorExposed = "#FF9800";
var colorInfectious = "#F44336";
var colorRecovered = "#2E7D32";
var colorExpired = "#000000"

const canvasWidth = 0.9 * window.innerWidth,
	canvasHeight = 0.9 * window.innerHeight,
	svgCanvas = d3.select('svg#canvas')
	.attr('width', canvasWidth)
	.attr('height', canvasHeight);

// Init parameters
retrieveParams();


const forceSim = d3.forceSimulation()
	.alphaDecay(0)
	.velocityDecay(0)
	.on('tick', particleDigest)
	.force('bounce', d3.forceBounce()
		.radius(d => d.r)
		.onImpact(handleImpact)
	)
	.force('container', d3.forceSurface()
		.surfaces([{
				from: {
					x: 0,
					y: 0
				},
				to: {
					x: 0,
					y: canvasHeight
				}

			},
			{
				from: {
					x: 0,
					y: canvasHeight
				},
				to: {
					x: canvasWidth,
					y: canvasHeight
				}

			},
			{
				from: {
					x: canvasWidth,
					y: canvasHeight
				},
				to: {
					x: canvasWidth,
					y: 0
				}

			},
			{
				from: {
					x: canvasWidth,
					y: 0
				},
				to: {
					x: 0,
					y: 0
				}

			}
		])
		.oneWay(true)
		.radius(d => d.r)
	);

// Event handlers
function onParameterChange() {

}

function onDensityChange(dd) {
	density = dd;
	const newNodes = genNodes(dd);
	d3.select('#num-particles-val').text(newNodes.length);
	d3.select('#density-control').attr('value', dd);
	forceSim.nodes(newNodes);
}



function onRadiusChange(rr) {
	let i = 0;

	radius = rr;
	d3.select('#radiusparticles-val').text(rr);
	d3.select('#radius-control').attr('value', rr);

	let particles = forceSim.nodes();
	for (i = 0; i < particles.length; i++) {
		particles[i].r = rr;
	}
}

function onVelocityChange(vv) {
	console.log("velocity changed 1", meanVelocity, vv);
	meanVelocity = INIT_MEAN_VELOCITY * vv;
	d3.select('#velocitymultiplier-val').text(vv);
	d3.select('#velocity-control').attr('value', vv);
	console.log("velocity changed 2", meanVelocity, vv);
}

function handleImpact(node1, node2) {
	//console.log("impact: ", node1, node2);
	if ((node1.c == colorInfectious) && (node2.c == colorSusceptible)) {
		node2.c = colorExposed;
		nbrExposed++;
		nbrSusceptible--;
	};
	if ((node2.c == colorInfectious) && (node1.c == colorSusceptible)) {
		node1.c = colorExposed;
		nbrExposed++;
		nbrSusceptible--;
	};
}


//

function genNodes(density) {
	const numParticles = Math.round(canvasWidth * canvasHeight * density),
		existingParticles = forceSim.nodes();

	// Trim
	if (numParticles < existingParticles.length) {
		return existingParticles.slice(0, numParticles);
	}

	// Append
	return [...existingParticles, ...d3.range(numParticles - existingParticles.length).map(() => {
		const angle = Math.random() * 2 * Math.PI,
			velocity = Math.random() * meanVelocity;

		return {
			x: Math.random() * canvasWidth,
			y: Math.random() * canvasHeight,
			vx: Math.cos(angle) * velocity,
			vy: Math.sin(angle) * velocity,
			r: radius,
			c: colorSusceptible
		}
	})];
}

function particleDigest() {
	let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes().map(hardLimit));

	particle.exit().remove();

	particle.merge(
			particle.enter().append('circle')
			.classed('particle', true)
			.attr('r', d => d.r)
			.attr('fill', d => d.c)
		)
		.attr('cx', d => d.x)
		.attr('cy', d => d.y)
		.attr('fill', d => d.c);
}

function hardLimit(node) {
	// Keep in canvas
	node.x = Math.max(node.r, Math.min(canvasWidth - node.r, node.x));
	node.y = Math.max(node.r, Math.min(canvasHeight - node.r, node.y));

	return node;
}

function retrieveParams() {

	console.log("Retrieve 1: ", density, radius, meanVelocity, nbrInfectious);

	density = localStorage.getItem("density");
	if (density == null) {
		density = INIT_DENSITY;
		localStorage.setItem("density", density);
	}

	radius = localStorage.getItem("radius");
	if (radius == null) {
		radius = INIT_RADIUS;
		localStorage.setItem("radius", radius);
	}

	meanVelocity = localStorage.getItem("meanVelocity");
	if (meanVelocity == null) {
		meanVelocity = INIT_MEAN_VELOCITY;
		localStorage.setItem("meanVelocity", meanVelocity);
	}

	nbrInfectious = localStorage.getItem("nbrInfectious");
	if (nbrInfectious == null) {
		nbrInfectious = INIT_INFECTIOUS;
		localStorage.setItem("nbrInfectious", nbrInfectious);
	}

	console.log("Retrieve 2: ", density, radius, meanVelocity, nbrInfectious);
}

function storeParams(dd, rr, vv, nI) {
	localStorage.setItem("density", dd);
	localStorage.setItem("radius", rr);
	localStorage.setItem("meanVelocity", vv);
	localStorage.setItem("nbrInfectious", nI);

	//console.log("Store: ", density, radius, meanVelocity, nbrInfectious);
}

function resetParams() {
	console.log("reset in:", density, radius, meanVelocity, nbrInfectious);
	storeParams(INIT_DENSITY, INIT_RADIUS, INIT_MEAN_VELOCITY, INIT_INFECTIOUS);
	retrieveParams();
	console.log("reset out:", density, radius, meanVelocity, nbrInfectious);
}