import "./styles/App.css";
import logo from "../../public/img/logo/logo32.png";
import {TrackingChart} from "./components/chart/tracking-chart";
import {Glossary} from "./components/glossary/glossary";
import {TrackerDefinitions} from "./components/tracker-definitions/tracker-definitions";

function App() {
  return (
    <>
      <div className="flex justify-end gap-4 items-center">
        <h1>Detecta</h1>
        <img src={logo} alt="detecta logo" />
      </div>
      <TrackingChart />
      <Glossary />
      <TrackerDefinitions />
    </>
  );
}

export default App;
