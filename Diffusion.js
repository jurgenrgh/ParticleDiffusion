const INIT_DENSITY = 0.000025; // particles per sq px
const INIT_RADIUS = 10;
const INIT_MEAN_VELOCITY = 2;
const INIT_INFECTIOUS = 1;

var density = 0;
var radius = 0;
var meanVelocity = 0;

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

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;
const svgCanvas = d3.select('svg#canvas')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight)
    .attr('border', "1");

density = INIT_DENSITY;
radius = INIT_RADIUS;
meanVelocity = INIT_MEAN_VELOCITY;
nbrInfectious = INIT_INFECTIOUS;

setSliders(); //Set up variable input widget values

var forceSim = d3.forceSimulation()
    .alphaDecay(0)
    .velocityDecay(0)
    .on('tick', particleDigest)
    .force('collision', d3.forceCollide().radius(d => d.r))

// Init particles
runSimulation();

function runSimulation() {
    console.log("run1");
    let newNodes = genNodes(density);
    forceSim.nodes(newNodes);
    console.log("run2");
}

function stopAndGo() {
    console.log("stop-and-go");
    forceSim.stop();
}

function restart() {
    console.log("restart");
    forceSim.restart();
}

function newInfection(nn) {
    forceSim.stop();
    let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes());
    let count = nn;
    //console.log("particle: ", particle.attr('fill'));

    particle.attr('fill', function (d) {
        if (count > 0) {
            count = count - 1;
            console.log("count return c: ", d.c);
            return colorInfectious;
        } else {
            console.log("else return c: ", d.c);
            return d.c;
        }
    });
    forceSim.restart();
}

// Event handlers
function onDensityChange(dd) {
    const newNodes = genNodes(dd);
    d3.select('#num-particles-val').text(newNodes.length);
    d3.select('#density-control').attr('value', dd);
    forceSim.nodes(newNodes);
    density = dd;
    storeParams();
}

function onInfectiousChange(dd) {
    console.log("infectious: ", dd);
    nbrInfectious = dd;
    d3.select('#num-infectious-val').text(dd);
    d3.select('#infectious-control').attr('value', dd);

}

function onRadiusChange(rr) {
    //forceSim.stop();
    d3.select('#radius-particles-val').text(rr);
    d3.select('#radius-control').attr('value', rr);
    radius = rr;
    storeParams();
    let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes());
    particle.attr('r', rr);
    //forceSim.nodes().map(changeRadius);
    console.log("radius: ", forceSim.force("collision").radius());
    forceSim.force("collision").radius(rr);
    //console.log("container: ", forceSim.force("container"))
    //forceSim.force("container").radius(rr);
}

function handleImpact(node1, node2) {
    //console.log("impact: ", node1, node2);
    let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes());
    particle.attr('fill', function (d, i) {})
    if ((node1.c == colorInfectious) && (node2.c == colorSusceptible)) {
        console.log("exposed 2: ", node1.c, node2.c);
        node2.c = colorExposed;
        nbrExposed++;
        nbrSusceptible--;
    };
    if ((node2.c == colorInfectious) && (node1.c == colorSusceptible)) {
        console.log("exposed 1: ", node1.c, node2.c);
        node1.c = colorExposed;
        nbrExposed++;
        nbrSusceptible--;
    };
}

function changeRadius(node) {
    node.r = radius;
}

function genNodes(dd) {
    const numParticles = Math.round(canvasWidth * canvasHeight * dd),
        existingParticles = forceSim.nodes();

    // Trim
    if (numParticles < existingParticles.length) {
        return existingParticles.slice(0, numParticles);
    }

    // Append
    return [...existingParticles, ...d3.range(numParticles - existingParticles.length).map(() => {
        const angle = Math.random() * 2 * Math.PI,
            velocity = Math.random() * 2 * meanVelocity;

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

function updateNodes() {

}

function particleDigest() {
    let particle = svgCanvas.selectAll('circle.particle').data(forceSim.nodes().map(hardLimit));

    particle.exit().remove();

    particle.merge(
            particle.enter().append('circle')
            .classed('particle', true)
            .attr('r', d => d.r)
            .attr('fill', colorSusceptible)
        )
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
}

function hardLimit(node) {
    console.log("limit");
    node.x = Math.max(node.r, Math.min(canvasWidth - node.r, node.x));
    node.y = Math.max(node.r, Math.min(canvasHeight - node.r, node.y));

    return node;
}

function retrieveParams() {
    console.log("retrieve 1: ", density, radius, meanVelocity, nbrInfectious);
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
    console.log("retrieve 2: ", density, radius, meanVelocity, nbrInfectious);
}

function storeParams() {
    localStorage.setItem("density", density);
    localStorage.setItem("radius", radius);
    localStorage.setItem("meanVelocity", meanVelocity);
    localStorage.setItem("nbrInfectious", nbrInfectious);
}

function resetParams() {
    console.log("reset");
    density = INIT_DENSITY;
    radius = INIT_RADIUS;
    meanVelocity = INIT_MEAN_VELOCITY;
    nbrInfectious = INIT_INFECTIOUS;

    localStorage.setItem("density", INIT_DENSITY);
    localStorage.setItem("radius", INIT_RADIUS);
    localStorage.setItem("meanVelocity", INIT_MEAN_VELOCITY);
    localStorage.setItem("nbrInfectious", INIT_INFECTIOUS);

    setSliders();
}

function setSliders() {
    let nn = Math.round(canvasWidth * canvasHeight * density);
    d3.select('#num-particles-val').text(nn);
    d3.select('#density-control').attr('value', density);
    d3.select('#num-infectious-val').text(nbrInfectious);
    d3.select('#infectious-control').attr('value', nbrInfectious);
    d3.select('#radius-particles-val').text(radius);
    d3.select('#radius-control').attr('value', radius);
    d3.select('#mean-velocity-val').text(meanVelocity);
    d3.select('#velocity-control').attr('value', meanVelocity);
}