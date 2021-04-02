Just speedgraph:

```js
import { Card, Map } from "../index";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
// prettier-ignore
<Card>
  <Map
    eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
    speedgraphData={sampleGraphData.SpeedGraph}
  >
    <Map.SpeedgraphConfig>
      <Map.Speedgraph />
    </Map.SpeedgraphConfig>
  </Map>
</Card>
```

With scrubber:

```js
import { Card, Map } from "../index";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
// prettier-ignor
<Card>
  <Map
    eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
    speedgraphData={sampleGraphData.SpeedGraph}
  >
    <Map.SpeedgraphConfig>
      <Map.SpeedgraphScrubber>
        <Map.Speedgraph />
      </Map.SpeedgraphScrubber>
    </Map.SpeedgraphConfig>
  </Map>
</Card>;
```

With scrubber and controls:

```js
import { Card, Map, Grid } from "../index";
import { SampleSpeedgraphConfigControls } from "../__fixtures__/SampleConfigControls";
import { sampleMappedEvents } from "../__fixtures__/sampleMappedEvents";
import { sampleJourneyData } from "../__fixtures__/sampleJourney";
import { sampleGraphData } from "../__fixtures__/sampleGraphData";
// prettier-ignor
<Card>
  <Map
    eventsList={sampleMappedEvents}
    polylineJSON={sampleJourneyData.Trip.TripPolylineSegments}
    speedgraphData={sampleGraphData.SpeedGraph}
  >
    <Map.SpeedgraphConfig>
      <Card.Body sx={{ gridTemplateColumns: "1fr 3fr", gap: "base" }}>
        <SampleSpeedgraphConfigControls />
        <Map.SpeedgraphScrubber>
          <Map.Speedgraph />
        </Map.SpeedgraphScrubber>
      </Card.Body>
    </Map.SpeedgraphConfig>
  </Map>
</Card>;
```
