import "./styles/App.css";
import logo from "../../public/img/logo/logo32.png";
import {TrackingChart} from "./components/chart/tracking-chart";
import {Glossary} from "./components/glossary/glossary";
import {TrackerDefinitions} from "./components/tracker-definitions/tracker-definitions";
import {HotspotToggle} from "./components/toggle/hotspot-toggle";

function App() {
  return (
    <>
      <div className="flex justify-between items-center">
        <HotspotToggle />
        <div className="flex gap-4 items-center">
          <h1>Detecta</h1>
          <img src={logo} alt="detecta logo" />
        </div>
      </div>
      <TrackingChart />
      <Glossary />
      <TrackerDefinitions />
    </>
  );
}

export default App;
