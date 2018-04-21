// const {href} = window.location;
const colorRange = ['#deebf7','#9ecae1','#3182bd'];

// d3 for color range + density
const colorScale = d3.scaleLinear()
  .domain([0, 1000, 2500])
  .range(colorRange);

const labelObj = {
  aa: 'Afr American',
  a: 'Asian',
  w: 'White',
  h: 'Hispanic',
  o: 'Other'
};

const inputs = document.querySelectorAll('input[type=radio]');

mapboxgl.accessToken = 'pk.eyJ1IjoibG9iZW5pY2hvdSIsImEiOiJjajdrb2czcDQwcHR5MnFycmhuZmo4eWwyIn0.nUf9dWGNVRnMApuhQ44VSw';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/lobenichou/cjfipi1fl099m2sqjl0tnsspo'
});


map.on('load', () => {
  // add the vector for beats that we uploaded into mapbox studio
  map.addSource('beats', {
    type: 'vector',
    url: 'mapbox://lobenichou.8uze4fl2'
  });

  // get our data
  d3.csv(`2015_oakland_stop_data.csv`, (error, data) => {
    let hashmap = {};
    if (error) throw error;
    // let's build our hashmap so that we can lookup our info easily
    // for clicks or hovers
    data.forEach((item) => {
      if (hashmap.hasOwnProperty(item.beat)) {
        hashmap[item.beat].push(item);
      } else {
        hashmap[item.beat] = [];
        hashmap[item.beat].push(item);
      }

      hashmap[item.beat].total_count = hashmap[item.beat].length;
    });


    // this is called data join
    // Get the extrusion height for the total count of stops for each beat
    const getExtrusionHeight = () => {
      const expression = ['match', ['get', 'Name']];
      for (const key in hashmap) {
        expression.push(key, hashmap[key].total_count);
      }
      expression.push(0)
      return expression;
    };

    const getExtrusionColor = () => {
      const expression = ['match', ['get', 'Name']];
      for (const key in hashmap) {
        expression.push(key, colorScale(hashmap[key].total_count));
      }
      expression.push('rgb(196, 195, 195)');
      return expression;
    }

    // we can also filter by race
    const getExtrusionHeightByRace = (race) => {
      const expression = ['match', ['get', 'Name']];

      for (const key in hashmap) {
        const newData = _.filter(hashmap[key], (o) => { return o.race === race; });
        expression.push(key, newData.length);
      }
      // add value for no or null data
      expression.push(0);

      return expression;
    }

    const getExtrusionColorByRace = (race) => {
      const expression = ['match', ['get', 'Name']];

      for (const key in hashmap) {
        const newData = _.filter(hashmap[key], (o) => { return o.race === race; });
        expression.push(key, colorScale(newData.length));
      }
      // add color for no or null data
      expression.push('rgb(196, 195, 195)');
      return expression;
    }

    // map.addLayer({
    //   "id": "stops-3d",
    //   "type": "fill-extrusion",
    //   "source": "beats",
    //   "source-layer": "CommunityPoliceBeats2009",
    //   "layout": {
    //     "visibility": "visible"
    //   },
    //   "paint": {
    //     "fill-extrusion-height": getExtrusionHeight(),
    //     "fill-extrusion-opacity": .7,
    //     "fill-extrusion-color": getExtrusionColor()
    //   }
    // }, "airport-label");


    map.addLayer({
      "id": "stops-fill",
      "type": "fill",
      "source": "beats",
      "source-layer": "CommunityPoliceBeats2009",
      "layout": {
        "visibility": "visible"
      },
      "paint": {
        // "fill-extrusion-height": getExtrusionHeight(),
        // "fill-extrusion-opacity": .7,
        "fill-color": getExtrusionColor(),
        "fill-outline-color": 'black'
      }
    }, "airport-label");

    const toggleLayer = (race) => {
      // map.setPaintProperty('stops-3d', 'fill-extrusion-height', getExtrusionHeightByRace(race));
      // map.setPaintProperty('stops-3d', 'fill-extrusion-color', getExtrusionColorByRace(race));
      map.setPaintProperty('stops-fill', 'fill-color', getExtrusionColorByRace(race));
    }

    inputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        if (e.target.value !== 'all') {
          toggleLayer(labelObj[e.target.value]);
        } else {
          // map.setPaintProperty('stops-3d', 'fill-extrusion-height', getExtrusionHeight());
          // map.setPaintProperty('stops-3d', 'fill-extrusion-color', getExtrusionColor());
          map.setPaintProperty('stops-fill', 'fill-color', getExtrusionColor());
        }
      })
    });

    // let currentlyHoveredBeat = '';
    // const popup = new mapboxgl.Popup({
    //     closeButton: false,
    //     closeOnClick: false
    // });

    // map.on('mousemove', 'stops-3d', (e) => {
    //    map.getCanvas().style.cursor = 'pointer';
    //   if (currentlyHoveredBeat === e.features[0].properties.Name) {return;}
    //   const coordinates = e.lngLat;
    //   currentlyHoveredBeat  = e.features[0].properties.Name;
    //   // Ensure that if the map is zoomed out such that multiple
    //     // copies of the feature are visible, the popup appears
    //     // over the copy being pointed to.
    //   popup
    //     .setLngLat(coordinates)
    //     .setHTML(hashmap[e.features[0].properties.Name][0].beat)
    //     .addTo(map);
    // })
    //
    // map.on('mouseleave', 'stops-3d', function() {
    //     map.getCanvas().style.cursor = '';
    //     popup.remove();
    // });
  });
});
