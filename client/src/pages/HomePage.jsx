import { useEffect, useState } from 'react';
import LineChartComponent from '../components/LineChartSocket';
import Logger from '../components/Logger';

const HomePage = () => {
  const [worker, setWorker] = useState(null);
  const [buttonState, setButtonState] = useState(false);
  const [res, setRes] = useState([]);
  const [log, setLog] = useState([]);
  
  const handleStartConnection = () => {
    worker.postMessage({
      connectionStatus: 'init',
    });
  };
  
  const handleStopConnection = () => {
    worker.postMessage({
      connectionStatus: 'stop',
    });
  };
  
  useEffect(() => {
    const myWorker = new Worker(
      new URL('../workers/main.worker.js', import.meta.url)
    );

    setWorker(myWorker);

    return () => {
      myWorker.terminate();
    }
  }, []);

  useEffect(() => {
    if (worker) {
      worker.onmessage = function (e) {
        if (typeof e.data === 'string') {
          if(e.data.includes('[')){
            setLog((preLogs) => [...preLogs, e.data]);
          } else {
            setRes((prevRes) => [...prevRes, { stockPrice: e.data }]);
          }
        }

        if (typeof e.data === 'object') {
          setButtonState(e.data.disableStartButton);
        }
      } 
    }
  }, [worker]);

  return (
    <>
      <div className="stats">
        <div className="control-panel">
          <h3>WebWorker Websocket example</h3>
          <button
            id="start-connection"
            onClick={handleStartConnection}
            disabled={!worker || buttonState}
          >
            Start Connection
          </button>
          &nbsp;
          <button
            id="stop-connection"
            onClick={handleStopConnection}
            disabled={!buttonState}
          >
            Stop Connection
          </button>
        </div>
        <LineChartComponent data={res} />
      </div>
      <Logger logs={log}/>
    </>
  );
};

export default HomePage;
