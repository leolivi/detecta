import "./styles/App.css";
import logo from "../../public/logo32.png";
import {TrackingChart} from "./components/chart/tracking-chart";

function App() {
  return (
    <>
      <div className="flex justify-end gap-4 items-center">
        <h1>Detecta</h1>
        <img src={logo} alt="detecta logo" />
      </div>
      <TrackingChart />
    </>
  );
}

export default App;
