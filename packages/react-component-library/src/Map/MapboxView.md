Just the `MapboxView` with a polyline

```js
import { Card, Map } from "../index";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
<Card variant="nopad">
  <Map
    // eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
    // speedgraphData={sampleGraphData.SpeedGraph}
  >
    <Map.MapboxView
      mapStyle="mapbox://styles/mapbox/streets-v11"
      containerStyle={{ height: "42.5531vw" }}
    />
  </Map>
</Card>;
```

With events added:

```js
import { Card, Map } from "../index";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
<Card variant="nopad">
  <Map
    eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
  >
    <Map.MapboxView
      mapStyle="mapbox://styles/mapbox/streets-v11"
      containerStyle={{ height: "42.5531vw" }}
    >
      <Map.MapboxViewEvents />
    </Map.MapboxView>
  </Map>
</Card>;
```

With speedgraph data:

```js
import { Card, Map } from "../index";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
<Card variant="nopad">
  <Map
    eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
    speedgraphData={sampleGraphData.SpeedGraph}
  >
    <Map.MapboxView
      mapStyle="mapbox://styles/mapbox/streets-v11"
      containerStyle={{ height: "42.5531vw" }}
    >
      <Map.MapboxViewEvents />
    </Map.MapboxView>
  </Map>
</Card>
```

With just an event:

```js
import { Card, Map } from "../index";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
<Card variant="nopad">
  <Map
    eventsList={[sampleMappedEvents[0]]}
    isSingleEventView={true}
  >
    <Map.MapboxView
      mapStyle="mapbox://styles/mapbox/streets-v11"
      containerStyle={{ height: "42.5531vw" }}
    >
      <Map.MapboxViewEvents />
    </Map.MapboxView>
  </Map>
</Card>
```