import "./styles/App.css";
import logo from "../../public/img/logo/logo32.png";
import {TrackingChart} from "./components/chart/tracking-chart";
import {Glossary} from "./components/glossary/glossary";

function App() {
  return (
    <>
      <div className="flex justify-end gap-4 items-center">
        <h1>Detecta</h1>
        <img src={logo} alt="detecta logo" />
      </div>
      <TrackingChart />
      <Glossary />
      {/* TODO:  add explanations as a component or as a tooltip?*/}
      <div className="pt-3">
        <h2 className="text-lg font-semibold">Explanations</h2>
        <p className="text-sm text-muted-foreground">
          Embedded Tracker are trackers that...
        </p>
        <p className="text-sm text-muted-foreground">
          Click-based Tracker are trackers that...
        </p>
      </div>
    </>
  );
}

export default App;
