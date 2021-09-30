import { useState, useEffect, useRef, React } from 'react'
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3'
import './App.css';
import DATA from './data/further-filtered.json'

import allende from './data/AllendeMeteorite.jpeg'
import mundrabilla from './data/Mundrabilla.jpeg'

import Title from './components/Title/index'
import Tooltip from './components/Tooltip/Tooltip.js'
import ScrollyStep from './components/ScrollyStep/ScrollyStep.js'




// TODO:
// map that animates when you click on meteorite
// https://heyhush.com/work/nike-retail-community-board-digital-product/

// TODO:
// show scale with label

function handleZoom(e) {
  // apply transform to the chart
  var test = d3.select('g#zoomEl')
    .attr('transform', e.transform);
}

let zoom = d3.zoom()
  .on('zoom', handleZoom);

const newSlice = DATA
// consts
const height = window.innerHeight - 38
const width = '100%'
const locations = [
  'Antarctica',
  'North America',
  'Europe',
  'South America',
  'Africa',
  'Oceania',
  'Asia',
  'Unknown',
]

// data modifying 
const sorted_data = d3.groupSort(
  newSlice,
  data => d3.median(data, d => d.weight),
  d => ({
    weight: +d.weight,
    link: d.link,
    title: d.title,
    place: d.place
  })
).slice(3)



console.log('HASFHAKLJSDHFJAKLSHFDKAJLSHFKJDALS', allende)

const getCX = (data, index) => {
  if (index == 0) {
    return sizeScale(data.weight)
  }
  return sorted_data.slice(0, index).reduce((acc, next, i, a) => acc + (sizeScale(next.weight) * 2), sizeScale(data.weight) + 10 * index)
}

const sizeScale = d3.scaleLinear()
  .domain([
    d3.min(sorted_data.map(d => d.weight)),
    d3.max(sorted_data.map(d => d.weight))
  ])
  .range([10, 10000])

const locationScale = d3.scaleLinear()
  .domain([
    d3.min(sorted_data.map(d => d.weight)),
    d3.max(sorted_data.map(d => d.weight))
  ])
  .range([10, 100000])


var color = d3.scaleOrdinal()
  .domain(locations)
  .range(d3.schemeSet1);

console.log('hello', color('North America'))
console.log('hello', color('Antarctica'))
console.log('hello', color('Antarctica'), sorted_data[5])


function App() {
  const [currScroll, setCurrScroll] = useState(0)
  const [zoomFn, setZoomFn] = useState(() => {})
  const [svgSelection, setSvgSelection] = useState({})
  const dataEl = useRef(null);

  useEffect(() => {
    console.log('done')

    // selection hell
    const svg = d3.select(dataEl.current)
      .append('svg')
        .attr('height', height)
        .attr('width', width)

    svg.call(zoom)

    console.log('hihi', document.querySelector('#data'))

    // enter selection stuff
    const enter = svg.append('g').attr('id', 'zoomEl')
      .selectAll('circle')
      .data(sorted_data)

    

    // put stuff on screen
    enter.enter()
      .append('circle')
      .attr('cx', (d, i) => getCX(d, i))
      .attr('cy', height / 2)
      .attr('r', (d, i) => sizeScale(d.weight))
      .attr('fill', (d) => !d.place ? color('Unknown') : color(d.place[0].content.split(',').pop().trim()))
      .attr('opacity', 0.9)
      .on('mouseover', function(e, d) {
        d3.select(this)
          .attr('stroke', 'black')
          .attr('stroke-width', 3)

        tooltip.style('opacity', 1)
          .attr('x', e.x - 100)
          .attr('y', e.y - 275)
          .html(ReactDOMServer.renderToString(<Tooltip {...d} />))
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'none')

          tooltip
          .transition()
          .duration(0)
          .style('opacity', 0)
          
      })

    setSvgSelection(svg)


    // legend stuff
    const label = svg.append('g').attr('id', 'legend')
      .selectAll('rect')
      .data(locations)
      .enter()

    label.append('rect')
      .attr('x', (_, i) => 25 + ((i % 4)*150))
      .attr('y', (_, i) => i >= 4 ? 60 : 30)
      .attr('height', 16)
      .attr('width', 16)
      .attr('fill', (d) => color(d))

    label.append('text')
      .attr('x', (_, i) => 25 + ((i % 4)*150) + 20)
      .attr('y', (_, i) => i >= 4 ? 60 + 13 : 30 + 13)
      .text(d => d)

    // tooltip stuff
    var tooltip = svg.append("foreignObject")
      .style('opacity', 0)
      .attr("width", 300)
      .attr("height", 125)

    // tooltip.on('mouseover', function(e, d) {
    //   console.log('i suck')
    //   tooltip.style('opacity', 1)
    // })
    // .on('mouseout', function(e, d) {
    //   tooltip.style('opacity', 1)
    // })

    tooltip.append("xhtml:div")
      .attr('class', 'tooltip')
      .style("font", "14px 'Helvetica Neue'")
      .html("<h1>An HTML Foreign Object in SVG</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu enim quam. ");


    
    // scale bar stuff
    // const scalePosX = 100
    // const scalePosY = height / 1.15

    // console.log(sorted_data[0].weight,sorted_data[1].weight, sizeScale(sorted_data[0].weight), sizeScale(sorted_data[1].weight))

    // var p = d3.line()([[0 + scalePosX, 0 + scalePosY], [0 + scalePosX, 10 + scalePosY], [60 + scalePosX, 10 + scalePosY], [60 + scalePosX, 0 + scalePosY]])
    // console.log('hii', p)
    // svg.append('path')
    //   .attr('d', p)
    //   .attr('fill', 'none')
    //   .attr('stroke', 'black')

    return () => document.querySelector("#data").innerHTML = ''
  }, [])

  // scrolly telling effects
  const listenScrollEvent = (e) => {
    console.log('hi', sorted_data[11292], e.target.scrollTop, height * 2)
    if (e.target.scrollTop > height && currScroll <= height) {
      console.log('asdfasdfasdf', sorted_data[0], getCX(sorted_data[0], 0))
      svgSelection
        .transition().duration(950).call(zoom.translateTo, getCX(sorted_data[0], 0), height /2)
        .transition().duration(950).call(zoom.scaleTo, 8)
    }

    if (e.target.scrollTop > (height * 2) && currScroll <= (height * 2)) {
      console.log('asdfasdfasdf', sorted_data[1000], getCX(sorted_data[1000], 1000))
      svgSelection
        .transition().duration(2250).call(zoom.scaleTo, 1)
        .transition().duration(2250).call(zoom.translateTo, getCX(sorted_data[1000], 1000), height /2)
    }

    if (e.target.scrollTop > (height * 3) && currScroll <= (height * 3)) {
      console.log('asdfasdfasdf', sorted_data[5445], getCX(sorted_data[5445], 5445))
      svgSelection
        .transition().duration(2250).call(zoom.translateTo, getCX(sorted_data[5445], 5445), height /2)
        .transition().duration(2250).call(zoom.scaleTo, 4)
    }

    if (e.target.scrollTop > (height * 5) && currScroll <= (height * 5)) {
      console.log('asdfasdfasdf', sorted_data[11293])
      svgSelection
      .transition().duration(2750).call(zoom.scaleTo, 0.01)
      .transition().duration(2750).call(zoom.translateTo, getCX(sorted_data[11292], 11292), height /2)
    }

    if (e.target.scrollTop > (height * 6 - 200) && currScroll <= (height * 6 - 200)) {
      console.log('asdfasdfasdf', sorted_data[11293])
      svgSelection
      .transition().duration(5000).call(zoom.transform, d3.zoomIdentity)
    }

    setCurrScroll(e.target.scrollTop)
  }


  return (
    <div className="App">
      <Title />
      <div id="interactive-container">
        <div id="chart-container">
          <div ref={dataEl} id="data"></div>
          {/* <div id="map">map will go here lol</div> */}
        </div>
        <div id="scroll-container" onScroll={listenScrollEvent}>
          {/* <button onClick={() => {
            svgSelection
              .transition().duration(750).call(zoom.translateTo, getCX(sorted_data[0], 0), height /2)
              .transition().duration(750).call(zoom.scaleTo, 5)

            }}>bonk</button>
          <button onClick={() => {
            // console.log(svgSelection, zoomFn)
            svgSelection.transition().call(zoom.scaleBy, 0.5)
            }}>bink</button> */}
            <ScrollyStep
              text="This is a visual representation of about 12,000 meteorites and meteorite fragments housed at The Smithsonian National Museum of Natural History. The range of sizes of these meteorites is enormous. Some are smaller than a grain of sand, while others would be too large to pick up off the ground. For this particular project, we are working with a collection of 40,482 specimens with robust metadata, filtered to 12,000 for the sake of brevity and browser performance. Though it is worth mentioning that The Smithsonian National Museum of Natural History houses more than 55,000 specimens of more than 20,000 distinct meteorites."
            />
            <ScrollyStep
              text="Let’s start off our tour with one of the smaller specimens in their collection. This is a tiny fragment from a meteorite called Yamato 7308. Yamato translates literally to 'great harmony' from Japanese. This particular meteorite was originally collected from Antarctica by the Japanese National Institute of Polar Research. This fragment weighs only 0.011 grams, approximately the same weight as a large ant. Did you know that ants can lift 50 times their bodyweight? The rest of this presentation will be about ant facts."
            />
            <ScrollyStep
              text="This fragment from Yamato 7308 has something in common with very many of the other specimens in this dataset. It, like many others, was originally retrieved in Antarctica. You might be wondering, do more meteorites fall in Antarctica for some reason? If not, why are most meteorites found there? There are multiple reasons for this, the first of which is glacial flow. As meteorites strike glaciers, they get buried in the ice and accumulate over thousands of years. As the glaciers slowly flow, the meteorites are carried with them. If a glacier runs up against a large obstacle, like the Transantarctic Mountains, the ice rises and meteorites are brought to the surface. Another reason is that while meteorites fall all over the world, some humid climates (like the Amazonian rainforest) are very corrosive to some meteorites, which are high in metallic iron. Did you know that Antarctica is one of the few places in the world where ant colonies are NOT found?"
            />
            <ScrollyStep
              text="Let’s move on to another meteorite of great prominence, the Allende Meteorite! Originally falling over Chihuahua, Mexico on February 8, 1969, the Allende meteorite is often described as “the best-studied meteorite in history”. This is largely because of the historical conditions at the time, in which many geopolitical superpowers were very interested in space science. This particular fragment weighs 23.18 grams, about the same as a AA battery, but approximately 2 to 3 tonnes of specimens have been collected in total from this meteorite over a period of 25 years. This is more than any human could feasibly lift, even if they had the same strength to weight ratio as an ant."
              image={allende}
            />
            <ScrollyStep
              text="I know what you’re all thinking at this point. You want to see the big meteorites. You’re wondering, “How much does the HEAVIEST meteorite (at the Natural History Museum) weigh”? Well, without further ado…"
            />
            <ScrollyStep
              text="Here she is. The mighty Mundrabilla meteorite is an iron meteorite that was found in 1911 in Western Australia. This particular slice, pictured below, weighs in at a whopping 48 kilograms, though the largest single fragment of Mundrabilla weighs 12.4 tonnes and is housed at the Western Australia Museum."
              image={mundrabilla}
            />
            <ScrollyStep
              text="Thanks for listening. Any questions?"
            />
        </div>
      </div>
      <div id="interactive-container">
        hello world
      </div>
    </div>
  );
}

export default App;
