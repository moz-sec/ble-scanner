import { useState, useEffect } from "react";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import {
  StartScan,
  StopScan,
  GetAverageRSSI,
  IsScanning,
  InitializeBLE,
} from "../wailsjs/go/main/App";
import { main } from "../wailsjs/go/models";

function App() {
  const [resultText, setResultText] = useState(
    "Click on the 'Start Scan' button to start the BLE scan."
  );
  const [devices, setDevices] = useState<main.DeviceRSSI[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<boolean>(true);
  const [rssiThreshold, setRssiThreshold] = useState<number>(100);

  // Initialize BLE at application startup
  useEffect(() => {
    const initBLE = async () => {
      try {
        await InitializeBLE();
        setResultText("Scanning can be started.");
      } catch (error) {
        setResultText(`Failed to initialize BLE: ${error}`);
      }
    };
    initBLE();
  }, []);

  // Scan status updated every second
  useEffect(() => {
    const checkScanStatus = async () => {
      const status = await IsScanning();
      setIsScanning(status);
    };
    const interval = setInterval(checkScanStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const startScanning = async () => {
    try {
      setDevices([]);
      setResultText("Scanning...");
      await StartScan();
    } catch (error) {
      setResultText(`Error occurred: ${error}`);
    }
  };

  const stopScanning = async () => {
    try {
      await StopScan();
      const averages = await GetAverageRSSI();
      setDevices(averages);
      setResultText("Scan stopped");
    } catch (error) {
      setResultText(`Error occurred during scan stop: ${error}`);
    }
  };

  const filteredDevices = filterEnabled
    ? devices.filter((device) => device.rssi > -rssiThreshold)
    : devices;

  return (
    <div id="App">
      <img
        src={logo}
        alt="logo"
        className="w-28 h-auto mx-auto mt-10 mb-4 rounded-lg shadow-lg"
      />
      <div className="text-lg font-semibold text-center mb-6 text-white opacity-80">
        {resultText}
      </div>
      <div className="flex justify-center mb-8">
        <button
          className={`px-6 py-2 rounded-md font-bold transition-colors duration-150 text-white ${
            isScanning
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning ? "Stop Scan" : "Start Scan"}
        </button>
      </div>
      <div className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl shadow-md px-8 py-4 max-w-xl mx-auto mb-8 text-white">
        <label className="flex items-center gap-2">
          <span className="text-sm">フィルタ</span>
          <span className="relative inline-block w-11 h-6 align-middle select-none">
            <input
              type="checkbox"
              checked={filterEnabled}
              onChange={(e) => setFilterEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <span className="block w-11 h-6 bg-gray-600 rounded-full peer-checked:bg-blue-500 transition-colors"></span>
            <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
          </span>
        </label>
        {filterEnabled && (
          <>
            <span className="text-sm">RSSI閾値:</span>
            <span className="text-sm">-</span>
            <input
              className="w-16 px-2 py-1 rounded bg-gray-900 border border-blue-500 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="number"
              step="1"
              value={rssiThreshold}
              onChange={(e) =>
                setRssiThreshold(Math.floor(Number(e.target.value)))
              }
            />
            <span className="text-sm">dBmより強い</span>
          </>
        )}
      </div>

      {!isScanning && filteredDevices.length > 0 && (
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">
            Detected Devices:
          </h3>
          <table className="min-w-full text-sm text-left text-white">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-700 rounded-tl-lg">
                  Device Address
                </th>
                <th className="px-4 py-2 bg-gray-700 rounded-tr-lg">
                  Average RSSI (dBm)
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr
                  key={device.uuid}
                  className="hover:bg-gray-600 transition-colors"
                >
                  <td className="px-4 py-2 break-all">{device.uuid}</td>
                  <td className="px-4 py-2">{device.rssi.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
